import { FhirXmlBuilder } from "../../../src/web/src/utils/fhirXmlBuilder";

const SAMPLE_PATIENT = {
  id: "p-001",
  active: true,
  doctorId: "doc-7",
  demographics: {
    nume: "Popescu",
    prenume: "Ion",
    cnp: "1900101010011",
    sex: "M",
    dataNasterii: "1955-04-12",
    telefon: "+40 712 345 678",
    email: "ion.popescu@example.ro",
    strada: "Str. Florilor 3",
    localitate: "Cluj-Napoca",
    judet: "Cluj",
    codPostal: "400000",
    tara: "RO",
  },
  latestSample: {
    ts: "2026-06-15T10:00:00Z",
    puls: 72,
    spo2: 97,
    temperatura: 36.6,
    umiditate: 45,
  },
};

const SAMPLE_VISIT = {
  id: "v-001",
  visitedAt: "2026-06-15T09:00:00Z",
  status: "Finalizata",
  motivPrezentare: "Control periodic",
  diagnosticIcd10Code: "I10",
  diagnosticIcd10Display: "Hipertensiune arteriala esentiala",
  simptome: "Cefalee usoara",
  trimiteri: "Cardiologie",
  retete: "Enalapril 5mg",
};

function buildXml(records) {
  const builder = new FhirXmlBuilder(records, { baseUrl: "https://test.local" });
  return builder.toXmlString();
}

describe("FhirXmlBuilder", () => {
  describe("Bundle structure", () => {
    test("returneaza un Bundle FHIR R4 cu declaratia XML", () => {
      const xml = buildXml([{ patient: SAMPLE_PATIENT }]);

      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
      expect(xml).toContain('<Bundle xmlns="http://hl7.org/fhir">');
      expect(xml).toContain('<type value="collection"/>');
    });

    test("calculeaza totalul de resurse din bundle", () => {
      const xml = buildXml([
        {
          patient: SAMPLE_PATIENT,
          visits: [SAMPLE_VISIT],
          allergies: [],
          recommendations: [],
          alerts: [],
        },
      ]);

      expect(xml).toContain('<total value="7"/>');
    });

    test("accepta intrari fara wrapper {patient,...} (lista de pacienti simpli)", () => {
      const xml = buildXml([SAMPLE_PATIENT]);
      expect(xml).toContain('<Patient xmlns="http://hl7.org/fhir">');
    });

    test("ignora intrarile fara patient", () => {
      const xml = buildXml([{ patient: null }]);
      expect(xml).toContain('<total value="0"/>');
    });
  });

  describe("Patient resource", () => {
    test("mapeaza datele demografice in resursa Patient", () => {
      const xml = buildXml([SAMPLE_PATIENT]);

      expect(xml).toContain('<id value="p-001"/>');
      expect(xml).toContain('<active value="true"/>');
      expect(xml).toContain('<family value="Popescu"/>');
      expect(xml).toContain('<given value="Ion"/>');
      expect(xml).toContain('<gender value="male"/>');
      expect(xml).toContain('<birthDate value="1955-04-12"/>');
      expect(xml).toContain('<city value="Cluj-Napoca"/>');
    });

    test("foloseste sistemul oficial pentru CNP-ul romanesc", () => {
      const xml = buildXml([SAMPLE_PATIENT]);

      expect(xml).toContain('<system value="https://hl7.ro/fhir/sid/cnp"/>');
      expect(xml).toContain('<value value="1900101010011"/>');
    });

    test("mapeaza sex F -> female si lipsa -> unknown", () => {
      const female = buildXml([
        { ...SAMPLE_PATIENT, id: "p-f", demographics: { ...SAMPLE_PATIENT.demographics, sex: "F" } },
      ]);
      expect(female).toContain('<gender value="female"/>');

      const unknown = buildXml([
        { ...SAMPLE_PATIENT, id: "p-u", demographics: { ...SAMPLE_PATIENT.demographics, sex: "" } },
      ]);
      expect(unknown).toContain('<gender value="unknown"/>');
    });
  });

  describe("Encounter / Condition", () => {
    test("genereaza Encounter cu status finished pentru consultatie finalizata", () => {
      const xml = buildXml([{ patient: SAMPLE_PATIENT, visits: [SAMPLE_VISIT] }]);

      expect(xml).toContain('<Encounter xmlns="http://hl7.org/fhir">');
      expect(xml).toContain('<status value="finished"/>');
      expect(xml).toContain('<reference value="Patient/p-001"/>');
    });

    test("ataseaza Condition cu cod ICD-10", () => {
      const xml = buildXml([{ patient: SAMPLE_PATIENT, visits: [SAMPLE_VISIT] }]);

      expect(xml).toContain('<Condition xmlns="http://hl7.org/fhir">');
      expect(xml).toContain('<system value="http://hl7.org/fhir/sid/icd-10"/>');
      expect(xml).toContain('<code value="I10"/>');
    });
  });

  describe("Observation (vital signs)", () => {
    test("creaza cate o Observation pentru puls, SpO2, temperatura si umiditate", () => {
      const xml = buildXml([SAMPLE_PATIENT]);

      const observations = xml.match(/<Observation xmlns="http:\/\/hl7\.org\/fhir">/g) || [];
      expect(observations).toHaveLength(4);

      expect(xml).toContain('<code value="8867-4"/>');
      expect(xml).toContain('<code value="59408-5"/>');
      expect(xml).toContain('<code value="8310-5"/>');
    });

    test("nu genereaza Observation daca lipseste latestSample", () => {
      const noSample = { ...SAMPLE_PATIENT, latestSample: null };
      const xml = buildXml([noSample]);
      expect(xml).not.toContain("<Observation");
    });
  });

  describe("XML escaping", () => {
    test("escapeaza caracterele speciale XML din valori text", () => {
      const patient = {
        ...SAMPLE_PATIENT,
        id: "p-x",
        demographics: { ...SAMPLE_PATIENT.demographics, nume: 'A & B <c>"d\'' },
      };
      const xml = buildXml([patient]);

      expect(xml).toContain("A &amp; B &lt;c&gt;&quot;d&apos;");
      expect(xml).not.toMatch(/A & B <c>"d'/);
    });
  });
});

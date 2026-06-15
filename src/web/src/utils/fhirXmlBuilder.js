const FHIR_NS = "http://hl7.org/fhir";
const CNP_SYSTEM = "https://hl7.ro/fhir/sid/cnp";
const ICD10_SYSTEM = "http://hl7.org/fhir/sid/icd-10";
const SNOMED_SYSTEM = "http://snomed.info/sct";
const LOINC_SYSTEM = "http://loinc.org";
const UCUM_SYSTEM = "http://unitsofmeasure.org";
const CONDITION_CLINICAL_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/condition-clinical";
const ALLERGY_CLINICAL_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical";
const OBSERVATION_CATEGORY_SYSTEM =
  "http://terminology.hl7.org/CodeSystem/observation-category";
const ACT_CODE_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-ActCode";

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

class XmlNode {
  constructor(name, attributes = {}) {
    this.name = name;
    this.attributes = attributes;
    this.children = [];
  }

  append(node) {
    this.children.push(node);
    return this;
  }

  child(name, attributes = {}) {
    const node = new XmlNode(name, attributes);
    this.children.push(node);
    return node;
  }

  value(name, value) {
    if (value === null || value === undefined || value === "") return this;
    this.children.push(new XmlNode(name, { value }));
    return this;
  }

  toXml(indent = 0) {
    const pad = "  ".repeat(indent);
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => ` ${k}="${escapeXml(v)}"`)
      .join("");

    if (this.children.length === 0) {
      return `${pad}<${this.name}${attrs}/>`;
    }

    const inner = this.children.map((c) => c.toXml(indent + 1)).join("\n");
    return `${pad}<${this.name}${attrs}>\n${inner}\n${pad}</${this.name}>`;
  }
}

function toFhirGender(sex) {
  switch ((sex || "").toUpperCase()) {
    case "M":
      return "male";
    case "F":
      return "female";
    case "O":
      return "other";
    default:
      return "unknown";
  }
}

function mapEncounterStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("final") || s.includes("incheiat") || s.includes("închei")) {
    return "finished";
  }
  if (s.includes("anul")) return "cancelled";
  return "in-progress";
}

function mapCarePlanStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("final") || s.includes("complet") || s.includes("incheiat")) {
    return "completed";
  }
  if (s.includes("anul") || s.includes("revoc")) return "revoked";
  return "active";
}

function mapAllergyClinicalStatus(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("arhiv") || s.includes("inactiv") || s.includes("rezolv")) {
    return "inactive";
  }
  return "active";
}

function mapReactionSeverity(severity) {
  const s = (severity || "").toLowerCase();
  if (s.includes("sever") || s.includes("grav") || s.includes("critic")) {
    return "severe";
  }
  if (s.includes("moder")) return "moderate";
  if (s.includes("usor") || s.includes("ușor") || s.includes("mild")) {
    return "mild";
  }
  return null;
}

function normalizeRecords(input) {
  if (!Array.isArray(input)) return [];
  return input.map((item) => {
    if (item && item.patient) {
      return {
        patient: item.patient,
        visits: item.visits || [],
        allergies: item.allergies || [],
        recommendations: item.recommendations || [],
        alerts: item.alerts || [],
      };
    }
    return {
      patient: item,
      visits: [],
      allergies: [],
      recommendations: [],
      alerts: [],
    };
  });
}

export class FhirXmlBuilder {
  constructor(records, options = {}) {
    this.records = normalizeRecords(records);
    this.baseUrl = options.baseUrl || window.location.origin;
    this.timestamp = new Date().toISOString();
  }

  buildPatientResource(patient) {
    const demo = patient.demographics || {};
    const node = new XmlNode("Patient", { xmlns: FHIR_NS });

    node.value("id", patient.id);

    if (demo.cnp) {
      node
        .child("identifier")
        .value("use", "official")
        .value("system", CNP_SYSTEM)
        .value("value", demo.cnp);
    }

    node.value("active", String(patient.active === true));

    if (demo.nume || demo.prenume) {
      node
        .child("name")
        .value("use", "official")
        .value("text", [demo.nume, demo.prenume].filter(Boolean).join(" "))
        .value("family", demo.nume)
        .value("given", demo.prenume);
    }

    if (demo.telefon) {
      node
        .child("telecom")
        .value("system", "phone")
        .value("value", demo.telefon)
        .value("use", "home");
    }
    if (demo.email) {
      node
        .child("telecom")
        .value("system", "email")
        .value("value", demo.email)
        .value("use", "home");
    }

    node.value("gender", toFhirGender(demo.sex));
    node.value("birthDate", demo.dataNasterii);

    if (demo.strada || demo.localitate || demo.judet || demo.codPostal || demo.tara) {
      node
        .child("address")
        .value("use", "home")
        .value("type", "physical")
        .value("line", demo.strada)
        .value("city", demo.localitate)
        .value("district", demo.judet)
        .value("postalCode", demo.codPostal)
        .value("country", demo.tara);
    }

    if (patient.doctorId) {
      node
        .child("generalPractitioner")
        .value("reference", `Practitioner/${patient.doctorId}`)
        .value("type", "Practitioner");
    }

    return node;
  }

  buildEncounterResource(visit, patientId) {
    const node = new XmlNode("Encounter", { xmlns: FHIR_NS });
    node.value("id", visit.id);
    node.value("status", mapEncounterStatus(visit.status));

    node
      .child("class")
      .value("system", ACT_CODE_SYSTEM)
      .value("code", "AMB")
      .value("display", "ambulatory");

    node.child("subject").value("reference", `Patient/${patientId}`);

    if (visit.motivPrezentare) {
      node.child("reasonCode").value("text", visit.motivPrezentare);
    }
    if (visit.visitedAt) {
      node.child("period").value("start", visit.visitedAt);
    }

    return node;
  }

  buildConditionResource(visit, patientId) {
    const hasDiagnosis = visit.diagnosticIcd10Code || visit.diagnosticIcd10Display;
    if (!hasDiagnosis && !visit.simptome && !visit.trimiteri && !visit.retete) {
      return null;
    }

    const node = new XmlNode("Condition", { xmlns: FHIR_NS });
    node.value("id", `${visit.id}-condition`);

    node
      .child("clinicalStatus")
      .child("coding")
      .value("system", CONDITION_CLINICAL_SYSTEM)
      .value("code", "active");

    const code = node.child("code");
    if (hasDiagnosis) {
      code
        .child("coding")
        .value("system", ICD10_SYSTEM)
        .value("code", visit.diagnosticIcd10Code)
        .value("display", visit.diagnosticIcd10Display);
    }
    code.value(
      "text",
      visit.diagnosticIcd10Display || visit.motivPrezentare || "Diagnostic"
    );

    node.child("subject").value("reference", `Patient/${patientId}`);
    node.child("encounter").value("reference", `Encounter/${visit.id}`);
    node.value("recordedDate", visit.visitedAt);

    if (visit.simptome) {
      node.child("note").value("text", `Simptome: ${visit.simptome}`);
    }
    if (visit.trimiteri) {
      node.child("note").value("text", `Trimiteri: ${visit.trimiteri}`);
    }
    if (visit.retete) {
      node.child("note").value("text", `Rețete: ${visit.retete}`);
    }

    return node;
  }

  buildAllergyResource(allergy, patientId) {
    const node = new XmlNode("AllergyIntolerance", { xmlns: FHIR_NS });
    node.value("id", allergy.id);

    node
      .child("clinicalStatus")
      .child("coding")
      .value("system", ALLERGY_CLINICAL_SYSTEM)
      .value("code", mapAllergyClinicalStatus(allergy.status));

    const code = node.child("code");
    if (allergy.substanceCode) {
      code
        .child("coding")
        .value("system", SNOMED_SYSTEM)
        .value("code", allergy.substanceCode)
        .value("display", allergy.substanceDisplay);
    }
    code.value("text", allergy.substanceDisplay || "Substanță necunoscută");

    node.child("patient").value("reference", `Patient/${patientId}`);
    node.value("recordedDate", allergy.recordedAt);

    if (allergy.reaction || allergy.severity) {
      const reaction = node.child("reaction");
      if (allergy.reaction) {
        reaction.child("manifestation").value("text", allergy.reaction);
      }
      const severity = mapReactionSeverity(allergy.severity);
      if (severity) {
        reaction.value("severity", severity);
      }
    }

    return node;
  }

  buildRecommendationResource(rec, patientId) {
    const node = new XmlNode("CarePlan", { xmlns: FHIR_NS });
    node.value("id", rec.id);
    node.value("status", mapCarePlanStatus(rec.status));
    node.value("intent", "plan");

    if (rec.tipActivitate) {
      node.child("title").value("value", rec.tipActivitate);
    }

    node.child("subject").value("reference", `Patient/${patientId}`);
    node.value("created", rec.recordedAt);

    const detail = node.child("activity").child("detail");
    detail.value("kind", "ServiceRequest");
    if (rec.tipActivitate) {
      detail.child("code").value("text", rec.tipActivitate);
    }
    detail.value("status", mapCarePlanStatus(rec.status) === "completed" ? "completed" : "scheduled");

    const descriptionParts = [];
    if (rec.durataZilnicaMinute) {
      descriptionParts.push(`${rec.durataZilnicaMinute} minute/zi`);
    }
    if (rec.alteIndicatii) {
      descriptionParts.push(rec.alteIndicatii);
    }
    if (descriptionParts.length > 0) {
      detail.value("description", descriptionParts.join(". "));
    }

    return node;
  }

  buildAlertResource(alert, patientId) {
    const node = new XmlNode("Flag", { xmlns: FHIR_NS });
    node.value("id", alert.id);
    node.value("status", "active");

    if (alert.severitate) {
      node.child("category").value("text", String(alert.severitate));
    }

    node.child("code").value("text", alert.textPacient || "Alertă");
    node.child("subject").value("reference", `Patient/${patientId}`);

    if (alert.triggeredAt) {
      node.child("period").value("start", alert.triggeredAt);
    }

    return node;
  }

  buildVitalObservations(patient) {
    const sample = patient.latestSample;
    if (!sample) return [];

    const observations = [];
    const effective = sample.ts;

    const addObservation = (suffix, loincCode, display, value, unit, ucum, system) => {
      if (value === null || value === undefined || value === "") return;

      const node = new XmlNode("Observation", { xmlns: FHIR_NS });
      const id = `${patient.id}-vital-${suffix}`;
      node.value("id", id);
      node.value("status", "final");

      node
        .child("category")
        .child("coding")
        .value("system", OBSERVATION_CATEGORY_SYSTEM)
        .value("code", "vital-signs")
        .value("display", "Vital Signs");

      const code = node.child("code");
      code
        .child("coding")
        .value("system", system || LOINC_SYSTEM)
        .value("code", loincCode)
        .value("display", display);
      code.value("text", display);

      node.child("subject").value("reference", `Patient/${patient.id}`);
      node.value("effectiveDateTime", effective);

      node
        .child("valueQuantity")
        .value("value", String(value))
        .value("unit", unit)
        .value("system", UCUM_SYSTEM)
        .value("code", ucum);

      observations.push({ id, node });
    };

    addObservation("puls", "8867-4", "Heart rate", sample.puls, "beats/minute", "/min");
    addObservation("spo2", "59408-5", "Oxygen saturation in Arterial blood by Pulse oximetry", sample.spo2, "%", "%");
    addObservation("temperatura", "8310-5", "Body temperature", sample.temperatura, "Cel", "Cel");
    addObservation(
      "umiditate",
      "humidity",
      "Ambient humidity",
      sample.umiditate,
      "%",
      "%",
      "https://seniorwatch.ro/fhir/sid/observation"
    );

    return observations;
  }

  buildResourceList() {
    const resources = [];

    for (const record of this.records) {
      const patient = record.patient;
      if (!patient) continue;

      resources.push({ node: this.buildPatientResource(patient) });

      for (const visit of record.visits) {
        resources.push({ node: this.buildEncounterResource(visit, patient.id) });
        const condition = this.buildConditionResource(visit, patient.id);
        if (condition) resources.push({ node: condition });
      }

      for (const allergy of record.allergies) {
        resources.push({ node: this.buildAllergyResource(allergy, patient.id) });
      }

      for (const rec of record.recommendations) {
        resources.push({ node: this.buildRecommendationResource(rec, patient.id) });
      }

      for (const alert of record.alerts) {
        resources.push({ node: this.buildAlertResource(alert, patient.id) });
      }

      for (const observation of this.buildVitalObservations(patient)) {
        resources.push({ node: observation.node });
      }
    }

    return resources;
  }

  getResourceId(node) {
    const idNode = node.children.find((c) => c.name === "id");
    return idNode ? idNode.attributes.value : "";
  }

  buildBundle() {
    const resources = this.buildResourceList();

    const bundle = new XmlNode("Bundle", { xmlns: FHIR_NS });
    bundle.value("id", `patients-export-${Date.now()}`);

    bundle
      .child("meta")
      .value("lastUpdated", this.timestamp)
      .value("profile", "http://hl7.org/fhir/StructureDefinition/Bundle");

    bundle.value("type", "collection");
    bundle.value("timestamp", this.timestamp);
    bundle.value("total", String(resources.length));

    bundle
      .child("link")
      .value("relation", "self")
      .value("url", `${this.baseUrl}/api/patients`);

    for (const { node } of resources) {
      const id = this.getResourceId(node);
      const entry = bundle.child("entry");
      entry.value("fullUrl", `${this.baseUrl}/fhir/${node.name}/${id}`);
      entry.child("resource").append(node);
    }

    return bundle;
  }

  toXmlString() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.buildBundle().toXml()}\n`;
  }
}

export default FhirXmlBuilder;

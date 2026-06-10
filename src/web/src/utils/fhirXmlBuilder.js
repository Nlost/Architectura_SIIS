const FHIR_NS = "http://hl7.org/fhir";
const CNP_SYSTEM = "https://hl7.ro/fhir/sid/cnp";

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

export class FhirXmlBuilder {
  constructor(patients, options = {}) {
    this.patients = Array.isArray(patients) ? patients : [];
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

  buildBundle() {
    const bundle = new XmlNode("Bundle", { xmlns: FHIR_NS });
    bundle.value("id", `patients-export-${Date.now()}`);

    bundle
      .child("meta")
      .value("lastUpdated", this.timestamp)
      .value("profile", "http://hl7.org/fhir/StructureDefinition/Bundle");

    bundle.value("type", "searchset");
    bundle.value("timestamp", this.timestamp);
    bundle.value("total", String(this.patients.length));

    bundle
      .child("link")
      .value("relation", "self")
      .value("url", `${this.baseUrl}/api/patients`);

    for (const patient of this.patients) {
      const entry = bundle.child("entry");
      entry.value("fullUrl", `urn:uuid:${patient.id}`);
      entry.child("resource").append(this.buildPatientResource(patient));
      entry.child("search").value("mode", "match");
    }

    return bundle;
  }

  toXmlString() {
    return `<?xml version="1.0" encoding="UTF-8"?>\n${this.buildBundle().toXml()}\n`;
  }
}

export default FhirXmlBuilder;

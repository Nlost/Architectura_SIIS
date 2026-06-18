/**
 * Derivează starea de sănătate din ultima măsurătoare (3 clase, ca Species din Iris.csv).
 */
export function getHealthStatus(sample) {
  if (!hasSensorData(sample)) {
    return "Stare-stabil";
  }

  const puls = toNumberOrZero(sample.puls);
  const temp = toNumberOrZero(sample.temperatura);
  const spo2 = toNumberOrZero(sample.spo2);
  const umid = toNumberOrZero(sample.umiditate);

  if (
    puls > 110 ||
    temp > 38 ||
    spo2 < 92 ||
    umid > 80
  ) {
    return "Stare-alerta";
  }

  if (
    puls > 95 ||
    temp > 37.5 ||
    spo2 < 95 ||
    umid > 70
  ) {
    return "Stare-observatie";
  }

  return "Stare-stabil";
}

function toNumberOrZero(value) {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function hasSensorData(sample) {
  if (!sample) return false;

  return [sample.puls, sample.spo2, sample.temperatura, sample.umiditate].some(
    (value) => value != null && value !== ""
  );
}

export class PatientCsvBuilder {
  constructor(patients) {
    this.patients = Array.isArray(patients) ? patients : [];
  }

  getExportRows() {
    const rows = [];
    let id = 1;

    for (const patient of this.patients) {
      const sample = patient.latestSample || {};

      rows.push({
        id,
        puls: toNumberOrZero(sample.puls),
        spo2: toNumberOrZero(sample.spo2),
        temperatura: toNumberOrZero(sample.temperatura),
        umiditate: toNumberOrZero(sample.umiditate),
        stareSanatate: getHealthStatus(sample),
      });
      id += 1;
    }

    return rows;
  }

  toCsvString() {
    const header = "Id,Puls,SpO2,Temperatura,Umiditate,StareSanatate";
    const rows = this.getExportRows().map(
      (row) =>
        `${row.id},${row.puls},${row.spo2},${row.temperatura},${row.umiditate},${row.stareSanatate}`
    );

    return [header, ...rows].join("\n");
  }
}

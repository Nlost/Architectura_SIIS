/**
 * Derivează starea de sănătate din ultima măsurătoare (3 clase, ca Species din Iris.csv).
 */
export function getHealthStatus(sample) {
  if (!sample) return null;

  const puls = Number(sample.puls);
  const temp = Number(sample.temperatura);
  const spo2 = Number(sample.spo2);
  const umid = Number(sample.umiditate);

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

function hasCompleteSample(sample) {
  return (
    sample &&
    sample.puls != null &&
    sample.spo2 != null &&
    sample.temperatura != null &&
    sample.umiditate != null
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
      const sample = patient.latestSample;
      if (!hasCompleteSample(sample)) continue;

      rows.push({
        id,
        puls: Number(sample.puls),
        spo2: Number(sample.spo2),
        temperatura: Number(sample.temperatura),
        umiditate: Number(sample.umiditate),
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

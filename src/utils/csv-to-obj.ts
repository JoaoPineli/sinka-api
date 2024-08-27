export function csvToObj(csv: string, delimiter = ','): any[] {
    const lines = csv.split('\n');
    const result = [];
    let headers = lines[0].split(delimiter).map((header) => header.trim());
    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentline = lines[i].split(delimiter);
        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j].trim();
        }
        result.push(obj);
    }
    return result;
}
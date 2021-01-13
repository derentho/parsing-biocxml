import { readLines } from "https://deno.land/std@0.83.0/io/mod.ts";
import { parseString } from "https://esm.sh/xml2js@0.4.23";
import { Document } from "./document.ts";

const timestamp = () => {
  const d = new Date();
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
}

if (import.meta.main) {
  const input = Deno.args[0];
  const output = Deno.args[1] || "output";

  const start = new Date();
  const file = await Deno.open(input);

  let parseCount = 0;
  let lineCount = 0;

  await Deno.writeTextFile(`${output}.xml`, "<?xml version='1.0' encoding='UTF-8'?>\n", { append: true });
  await Deno.writeTextFile(`${output}.xml`, "<collection>\n", { append: true });
  await Deno.writeTextFile(`${output}.json`, "[\n", { append: true });

  for await (const line of readLines(file)) {
    parseString(line, async (err, res) => {
      if (err || !res) return;

      const extract = new Document();
      let validate = false;
      for (const passage of res.document.passage) {
        for (const infon of passage.infon) {
          if (infon.$.key == "article-id_pmid") {
            extract.PMID = Number(infon._);
          }
          if (infon.$.key == "section_type" && infon._ == "TITLE") {
            extract.title = passage.text.join(" ");
          }
          if (infon.$.key == "section_type" && infon._ == "ABSTRACT") {
            extract.abstract += passage.text;
          }
          if (infon.$.key == "section_type" && infon._ == "REF") {
            validate = true;
          }
          if (infon.$.key == "pub-id_pmid") {
            extract.references.push(Number(infon._));
          }
        }
      }

      if (!validate) {
        extract.references = [];
      }
      validate = false;
      if (extract.PMID == 0) {
        return;
      }
      await Deno.writeTextFile(`${output}.xml`, extract.toXML(), { append: true });
      await Deno.writeTextFile(`${output}.json`, extract.toJSON(), { append: true });
      await Deno.writeTextFile(`${output}.resume.txt`, extract.toResumeTXT(), { append: true });
      await Deno.writeTextFile(`${output}.references.txt`, extract.toReferencesTXT(), { append: true });
      parseCount += 1;
    });
    lineCount += 1;
    console.log(`${timestamp()} : Parsed ${lineCount} lines (${parseCount} results)...`);
  }

  await Deno.writeTextFile(`${output}.xml`, "</collection>", { append: true });
  await Deno.writeTextFile(`${output}.json`, "]", { append: true });

  console.log(`Started at ${start}`);
  console.log(`Ended at ${new Date()}`);
}

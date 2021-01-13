PERMISSIONS = --allow-read --allow-write

run:
	@deno run $(PERMISSIONS) mod.ts litcovid2BioCXML.xml

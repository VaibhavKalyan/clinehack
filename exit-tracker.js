const orig = process.exit; process.exit = function(code) { console.trace("Explicit exit", code); orig.call(process, code); };

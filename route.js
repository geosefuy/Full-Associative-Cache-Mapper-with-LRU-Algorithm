const {
    simulate,
    checkPowerofTwo,
    isNumeric,
    
    textFile
} = require("./computation")

module.exports = {
    home: (req, res) => {
        res.render('simulation.ejs', {
            result: false,
            machineType: false,
            cacheMiss: false,
            blockInput: false,
            mmInput: false,
            cacheInput: false,
            readInput: false,
            cacheTime: false,
            memoryTime: false,
            blockError: false,
            mmError: false,
            cacheError: false,
            seqError: false,
        });
    },
    calculate: (req, res) => {
        // config1 = word or byte addressable (word, byte)
        // config2 = non or load through (nonload, load)
        // config3 = main memory size (blocks, words/bytes)
        // config3 = cache memory size (blocks, words/bytes)
        // config3 = read sequence (blocks, address)
        let data = {
            machineType: null,
            cacheMiss: null,
            blockSize: 0,
            blockInput: null,
            mmSize: 0,
            mmType: null,
            mmInput: null,
            cacheSize: 0,
            cacheType: null,
            cacheInput: null,
            readSeq: null,
            readType: null,
            readInput: null,
            cacheTime: null,
            memoryTime: null,
            loadType: req.body.config2
        }
        let result

        if (req.body.config1 == "word") {
            data.machineType = "Word Addressable";
            //console.log(data.machineType);
        } else {
            data.machineType = "Byte Addressable";
            //console.log(data.machineType);
        }

        if (req.body.config2 == "nonload") {
            data.cacheMiss = "Non Load-Through";
            //console.log(data.cacheMiss);
        } else {
            data.cacheMiss = "Load-Through";
            //console.log(data.cacheMiss);
        }
        
        data.blockSize = req.body.blockSize;
        //console.log("Block size: " + data.blockSize + " Words/Bytes")
        if (data.machineType == "Word Addressable") {
            data.blockInput = data.blockSize + " Word(s)";
        } else {
            data.blockInput = data.blockSize + " Byte(s)";
        }
        
        data.mmType = req.body.config3
        if (data.mmType == "blocks") {
            data.mmSize = req.body.mmSizeBlocks;
            //console.log("Main Memory size: " + data.mmSize + " Blocks")
            data.mmInput = data.mmSize + " Block(s)";
        } else {
            data.mmSize = req.body.mmSizeWords;
            //console.log("Main Memory size: " + data.mmSize + " Words/Bytes")
            if (data.machineType == "Word Addressable") {
                data.mmInput = data.mmSize + " Word(s)";
            } else {
                data.mmInput = data.mmSize + " Byte(s)";
            }
        }
        
        data.cacheType = req.body.config4
        if (data.cacheType == "blocks") {
            data.cacheSize = req.body.cacheSizeBlocks;
            //console.log("Cache Memory size: " + data.cacheSize + " Blocks")
            data.cacheInput = data.cacheSize + " Block(s)";
        } else {
            data.cacheSize = req.body.cacheSizeWords;
            //console.log("Cache Memory size: " + data.cacheSize + " Words/Bytes")
            if (data.machineType == "Word Addressable") {
                data.cacheInput = data.cacheSize + " Word(s)";
            } else {
                data.cacheInput = data.cacheSize + " Byte(s)";
            }
        }
        
        data.readType = req.body.config5
        if (data.readType == "blocks") {
            data.readSeq = req.body.readBlocks;
            //console.log("Read Sequence: Blocks - " + data.readSeq)
            data.readInput = "Block - " + data.readSeq;
        } else {
            data.readSeq = req.body.readAddress;
            //console.log("Read Sequence: Address - " + data.readSeq)
            data.readInput = "Address - " + data.readSeq;
        }

        data.cacheTime = req.body.cacheTime;
        data.memoryTime = req.body.memoryTime;

        simulate(data)
        let error = false;
        let blockError = false;
        let mmError = false;
        let cacheError = false;
        let seqError = false;
        if (!checkPowerofTwo(parseInt(data.blockSize))){
            error = true;
            blockError = true;
        }
        if (!checkPowerofTwo(parseInt(data.mmSize))){
            error = true;
            mmError = true;
        }
        if (!checkPowerofTwo(parseInt(data.cacheSize))){
            error = true;
            cacheError = true;
        }

        let splitSequence = Array.isArray(data.readSeq) ? data.readSeq : data.readSeq.split('\r\n')

        for (let i = 0; i < splitSequence.length; i++) {
        
            let currentIns = splitSequence[i];
    
            if (currentIns.includes('L')) {
                currentIns = currentIns.split(',')
                if (currentIns.length > 2){
                    error = true;
                    seqError = true;
                }
                else if (currentIns.length == 2){
                    if (!isNumeric(currentIns[1].trim())){
                        error = true;
                        seqError = true;
                    }
                    if (!isNumeric(currentIns[0].substr(1).trim())){
                        error = true;
                        seqError = true;
                    }
                }
                else{
                    if (!isNumeric(currentIns[0].substr(1).trim())){
                        error = true;
                        seqError = true;
                    }
                }
            } else if (currentIns.includes(',')) {
                currentIns = currentIns.split(',')
                if (currentIns.length > 2){
                    error = true;
                    seqError = true;
                }
                else{
                    if (!isNumeric(currentIns[1].trim())){
                        error = true;
                        seqError = true;
                    }
                    if (!isNumeric(currentIns[0].trim())){
                        error = true;
                        seqError = true;
                    }
                }
            } else {
                if (!isNumeric(currentIns.trim())){
                    error = true;
                    seqError = true;
                }
            }
        }
        //L1, 2
        // Check for overflow either in block or word

        if (error)
            res.render('simulation.ejs', { // Pass data to front end
                result: false,
                machineType: data.machineType,
                cacheMiss: data.cacheMiss,
                blockInput: data.blockInput,
                mmInput: data.mmInput,
                cacheInput: data.cacheInput,
                readInput: data.readInput,
                cacheTime: data.cacheTime,
                memoryTime: data.memoryTime,
                blockError: blockError,
                mmError: mmError,
                cacheError: cacheError,
                seqError: seqError,
            });
        else
            res.render('simulation.ejs', { // Pass data to front end
                result: true,
                machineType: data.machineType,
                cacheMiss: data.cacheMiss,
                blockInput: data.blockInput,
                mmInput: data.mmInput,
                cacheInput: data.cacheInput,
                readInput: data.readInput,
                cacheTime: data.cacheTime,
                memoryTime: data.memoryTime,
                blockError: false,
                mmError: false,
                cacheError: false,
                seqError: false,
            });
    },
}
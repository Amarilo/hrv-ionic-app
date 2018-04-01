export class UtilityService {

    //=== Ionic cordova methods data <<>> String ===
    
    bytesToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }

    stringToBytes(string) {
        var array = new Uint8Array(string.length);
        for (var i = 0, l = string.length; i < l; i++) {
            array[i] = string.charCodeAt(i);
        }
        return array.buffer;
    }

    //=== String >> To Python format ===

    stringToDecimalArray(bString){
        var array = [];
        for(var i = 0; i < bString.length; i++) {
            array.push( bString.charCodeAt(i).toString() );
        }
        return array;
    }

    stringToHexArray(bString) {
        var array = [];
        var dArray = this.stringToDecimalArray(bString);
        for(var i = 0; i < dArray.length; i++) {
            var hex = "0" + parseInt(dArray[i]).toString(16);
            hex = hex.slice(-2);
            array.push( hex );
        }
        return array;

    }

    //=== Python format >> HR ===

    hexToBinary(hex){
        var dec = parseInt(hex, 16);
        var bin = dec.toString(2);
        var res = '00000000' + bin;
        return res.slice(-8);
    }

    hexToDecimal(hex){
        return parseInt(hex, 16);
    }

    twoBytesToDecimal(hexArray){
        const hexValue = hexArray[1] + hexArray[0];
        return this.hexToDecimal(hexValue);
    }

    getFlags(bin){
        const flags = {
            isHR16: Boolean(Number(bin[7-0])), // 0bit HR 8bits or 16bits
            isEE_present: Boolean(Number(bin[7-3])), // 3bit is Energy Expended Status (16bits) present 
            isRRpresent: Boolean(Number(bin[7-4])) // 4bit is one or more RR interval (16bits) present
        };
        return flags;
    }

    makeSense(hexArray){
        let result = {HR: [], RR:[]};
        const flags = this.getFlags(this.hexToBinary(hexArray[0]));
        hexArray.splice(0, 1);

        if(flags.isHR16){
            result.HR.push(this.twoBytesToDecimal(hexArray));
            hexArray.splice(0, 2);
        }else{
            result.HR.push(this.hexToDecimal(hexArray));
            hexArray.splice(0, 1);
        }

        if(flags.isEE_present){
            hexArray.splice(0, 2);
        }

        if(flags.isRRpresent){
            while(hexArray.length > 1){
                result.RR.push(this.twoBytesToDecimal(hexArray));
                hexArray.splice(0, 2);
            }
        }

        return result;
    }

    rrToHR(rr){
        const rrInterval = (rr/1024.0);
        const bpm = 60 / rrInterval;
        return Math.round(bpm);;
    }

    getRRHR_array(result){
        let rrhrArr = [];
        if(result.RR.length > 0){
            for(var i = 0; i < result.RR.length; i++){
                rrhrArr.push(this.rrToHR(result.RR[i]));
            }
        }
        return rrhrArr;
    }

    // === HR >> Coherence ===

    getAutocorrelation(hrArray){
        const n = hrArray.length;
        
        const mean = this.mean(hrArray);
        const c0 = this.sum(this.subtractSquareArray(hrArray, mean)) / n;
        const lag = Math.round(n/3);
        const x = Array.from(new Array(lag), (x,i) => i+1);
        const y = this.mapR(x, hrArray, n, c0, mean);
        const z95 = 1.959963984540054;
        const z99 = 2.5758293035489004;
        const conf99 = z99 / Math.sqrt(n);
        const conf95 = z95 / Math.sqrt(n);
        // x can be assumed from y length
        return {x: x, y: y, conf95: conf95, conf99: conf99};
    }

    getCoherence(autoCorrelation){
        let coherent_hits = 0;
        const yArr = autoCorrelation.y;
        const total = yArr.length;
        const conf99 = autoCorrelation.conf99;
        for(let i = 0; i < yArr.length; i++){
            const y = yArr[i];
            if(y > conf99 || y < -conf99){
                coherent_hits = coherent_hits + 1;
            }
        }
        const coherence = Math.round(coherent_hits / total * 100);
        return {coherence: coherence, hits: coherent_hits, total: total};
    }

    mapR(lagArray, hrArray, n, c0, mean){
        let yArray = lagArray.map(
            (h) => {
                const arrPt1 = hrArray.slice(0, n - h);
                const arrPt2 = hrArray.slice(h);
                const arrSum = this.sum(
                    this.multiplyArrays(
                        this.subtractArray(arrPt1, mean),
                        this.subtractArray(arrPt2, mean)
                    )
                );
                return arrSum / n / c0;
            }
        );

        return yArray;
    }

    multiplyArrays(arr1, arr2){
        return arr1.map(
            (num, i) => {
              return num * arr2[i];
          }
        );
    }

    subtractArray(array, value){
        return array.map(
            (num) => {
                return (num - value);
            }
        )
    }

    subtractSquareArray(array, value){
        return array.map(
            (num) => {
                return (num - value) ** 2;
            }
        )
    }

    mean(arr){
        const sum = this.sum(arr);
        const mean = sum / arr.length;
        return mean;
    }

    sum(arr){
        const sum = arr.reduce(
            (total, num) => {
                return total + num;
            }
        );
        return sum;
    }

    //=== other ===

    charToInt(char){
        var dec = char.charCodeAt(0);
        var hex = "0" + dec.toString(16);
        hex = hex.slice(-2);
        console.log("hex: " + hex);
        console.log("dec: " + dec);

        //charToInt("X");
        // hex: 58
        // dec: 88
      }
    
    print(obj){
        console.log(JSON.stringify(obj));
    }
      
      
}
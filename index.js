const pinyinConvert = require('hanzi-to-pinyin');
const zhuyinify = require('zhuyin');
const hanziFrequency = require("@zurawiki/hanzi");
const rhymingDictionary = require('./rhyming-dictionary.json');

// used to remove smybols which do not contribute to rhyming
const SYMBOLS_ARRAY = [",", "·"];

// used to substitute for Chinese words that contain English letters e.g. A咖
// note many of these zhuyin combinations do not exist in mandarin Chinese
// in these cases approximations exist for the purpose of determining rhyming
const ZHUYIN_ENGLISH_SUBS = {
  A: "ㄟ",
  B: "ㄅㄧ",
  C: "ㄙㄧ",
  D: "ㄉㄧ",
  E: "ㄧ",
  G: "ㄐㄧ",
  H: "ㄟㄔㄜ",
  K: "ㄎㄟ",
  L: "ㄝㄌㄜ",
  M: "ㄝㄇㄜ",
  N: "ㄝㄋ",
  O: "ㄡ",
  P: "ㄆㄧ",
  R: "ㄦ",
  S: "ㄝㄙㄜ",
  T: "ㄊㄧ",
  U: "ㄧㄨ",
  Q: "ㄎㄧㄨ",
  // no consonant v sound exists in mandarin
  // although ㄧ is sufficient to determine rhyming, ø is added for consistency
  V: "øㄧ",
  X: "ㄝㄜㄙ"
}

// represents zhyin tone markings: 2, 3, 4, 5 (neutral), respectively
// note that 1st tone in zhuyin is unmarked
// (as opposed to 5th/neutral tone being unmarked in pinyin)
const ZHUYIN_TONES = ["ˊ", "ˇ", "`", "˙"];

// represents pinyin zi, ci, si
// zhuyin vowel doesn't exist, replaced with ɯ
// or replaced with ø for fuzzy rhyming between these series (<- currently)
const DENTI_ALVEOLAR_SERIES = ["ㄗ", "ㄙ", "ㄘ"]

// represents pinyin zhi, chi, shi, ri
// zhuyin vowel doesn't exist replaced with ɨ
// or replaced with ø for fuzzy rhyming between these series (<- currently)
const RETROFLEX_SERIES = ["ㄓ", "ㄔ", "ㄕ", "ㄖ"];

// used to provide secondary vowel in cases when final vowel is nasal
// in these cases, the final vowel is not sufficient to determine rhyming
const NASAL_SERIES = ["ㄢ", "ㄣ", "ㄤ", "ㄥ"];
const MEDIAL_SERIES = ["ㄧ", "ㄨ", "ㄩ"]

class MandarinRhymes {
  constructor(hanzi) {
    this.hanzi = hanzi;
    this.matchTones = false;
  }

  async getRhymes() {
    // convert hanzi to pinyin w/ tone numbers
    var pinyinNumeric = await pinyinConvert(this.hanzi, {
      numbered: true
    });
    // get information from hanzi
    var pinyinNumericArray = [];
    pinyinNumeric.forEach(element => {
      if (Array.isArray(element)) {
        pinyinNumericArray.push(element[0]);
      } else {
        pinyinNumericArray.push(...element.split(" ").filter(syllable => syllable != ""));
      }
    });

    var zhuyinArray = this.getZhuyinArray(pinyinNumericArray);
    var toneNumberArray = this.getToneNumberArray(pinyinNumericArray);
    this.self = {
      toneNumberArray
    };
    var vowelArray = this.getVowelArray(zhuyinArray);

    var subDictionary = rhymingDictionary;
    // loop through vowels
    for (var v = 0; v < vowelArray.length; v++) {
      var vowel = vowelArray[v]
      var tone = toneNumberArray[v];
      // if there is no a Subdirectory under this vowel
      if (!(subDictionary && subDictionary[vowel])) {
        return {
          self: this.self,
          rhymes: []
        };
      } else {
        subDictionary = subDictionary[vowel]
      }
    }
    this.rhymes = subDictionary.words || [];
    this.addAverageFrequencies()
    this.sortByFrequency();
    this.separateSelf();
    if (this.matchTones) {
      this.filterByToneMatching();
    }
    // reset syntactic sugar fields to initial value for use in usubsequent calls
    this.matchTones = false;

    return {
      self: this.self,
      rhymes: this.rhymes
    };
  }

  // helper methods
  filterByToneMatching() {
    this.rhymes = this.rhymes.filter(this.matchesSelfTones.bind(this));
  }

  matchesSelfTones(word) {
    var isMatch = true;
    for (var i = 0; i < word.toneNumberArray.length; i++) {
      if (word.toneNumberArray[i] != this.self.toneNumberArray[i]) {
        isMatch = false;
      };
    }
    return isMatch;
  }

  getZhuyinArray(pinyinArray) {
    return pinyinArray.map((pinyin) => {
      var zhuyin;
      // used
      var letters = /^[A-Za-z]+$/;
      var hasEnglish = pinyin.match(letters) && pinyin.length == 1;
      // work-around for bug which causes ü to show up as undefined in zhuyin conversion
      var hasU = pinyin.indexOf("ü") != -1;
      var hasUE = pinyin.indexOf("üe") != -1;
      // word-around for bug which causes er-hua to show up as undefined in zhuyin conversion
      var hasErHua = pinyin == "r5";
      // check if Chinese word contains any English letters
      if (hasEnglish) {
        zhuyin = ZHUYIN_ENGLISH_SUBS[pinyin.toUpperCase()];
      } else if (hasU) {
        var initial = pinyin.substring(0, pinyin.indexOf("ü"));
        // dummyPinyin is used to get tone and initial
        var dummyPinyin = initial + "a" + pinyin.substring(pinyin.length - 1);
        var dummyZhuyin = zhuyinify(dummyPinyin)[0];
        var zhuyinTone = dummyZhuyin[dummyZhuyin.length - 1];
        // -2 to strip last two characters: tone and dummy "a"
        var zhuyinInitial = dummyZhuyin.substring(0, dummyZhuyin.length - 2);
        var zhuyinVowel = hasUE ? "ㄩㄝ" : "ㄩ";
        zhuyin = zhuyinInitial + zhuyinVowel + zhuyinTone;
      } else if (hasErHua) {
        zhuyin = "儿˙"
      } else {
        zhuyin = zhuyinify(pinyin)[0];
      }
      return zhuyin;
    });
  }

  getToneNumberArray(pinyinArray) {
    return pinyinArray.map(pinyin => {
      var tone = pinyin[pinyin.length - 1];
      var numbers = /^[0-9]+$/;
      // used to sanitize pinyin representation of certain words which contain English letters
      // e.g. A咖 where the A is not marked with any number 1-5 for tone, but is generally read as 1st tone
      return tone.match(numbers) ? tone : 1;
    });
  }

  getToneStrippedZhuyinArray(toneMarkedZhuyinArray) {
    return toneMarkedZhuyinArray.map(toneMarkedZhuyin => {
      var toneStrippedZhuyin;
      var lastChar = toneMarkedZhuyin[toneMarkedZhuyin.length - 1];
      var toneIndex = ZHUYIN_TONES.indexOf(lastChar);
      // if tone is not 1st tone, remove the final character (tone marking)
      if (toneIndex != -1) {
        toneStrippedZhuyin = toneMarkedZhuyin.substring(0, toneMarkedZhuyin.length - 1);
      }
      // else tone is 1st tone (unmarked), nothing to strip
      else {
        toneStrippedZhuyin = toneMarkedZhuyin;
      }
      return toneStrippedZhuyin
    });
  }

  getVowelArray(zhuyinArray) {
    var toneStrippedZhuyinArray = this.getToneStrippedZhuyinArray(zhuyinArray);
    return toneStrippedZhuyinArray.map(zhuyin => {
      var vowel;
      var lastChar = zhuyin[zhuyin.length - 1];
      var penultimateChar = zhuyin[zhuyin.length - 2];
      // if lastChar is in either denti alveolar or retroflex series, use dummy vowel
      // "ø" is used to represent the absence of a zhuyin character for the vowel
      if (DENTI_ALVEOLAR_SERIES.indexOf(lastChar) !== -1)
        //vowel = "ɯ";
        vowel = "ø";
      else if (RETROFLEX_SERIES.indexOf(lastChar) !== -1)
        //vowel = "ɨ";
        vowel = "ø";
      // for the following vowels (nasals): ㄢ, ㄤ, ㄣ, ㄥ
      // an additional vowel is needed to determine rhyming, so return last 2 chars
      else if (NASAL_SERIES.indexOf(lastChar) != -1) {
        // second vowel is equal to either a member of medial series or ø (representing no secondary vowel)
        if (penultimateChar == "ㄧ") {
          vowel = "ㄧ" + lastChar;
        }
        // in the case of ㄨ and ㄩ followed by the nasal ㄥ
        // the vowel sounds merge together (and therefore rhyme)
        // the combination ㄨ/ㄩ is represented by "u" here (which approximates their pinyin equivalents of u/ü)
        else if (penultimateChar == "ㄨ" || penultimateChar == "ㄩ") {
          vowel = (lastChar == "ㄥ" ? "u" : penultimateChar) + lastChar;
        } else {
          vowel = "ø" + lastChar;
        }
      } else {
        vowel = lastChar;
      }
      return vowel;
    })
  }

  getWordFrequency() {
    var sumNumber = this.hanzi.split("").reduce((accumulator, currentValue) => {
      return parseInt(accumulator) + parseInt(hanziFrequency.getCharacterFrequency(currentValue).number);
    }, 0);
    return sumNumber / this.hanzi.length;
  }

  addAverageFrequencies() {
    this.rhymes = this.rhymes.map(word => {
      return { ...word,
        averageFrequency: this.getWordFrequency(word.simplified)
      };
    });
  }

  sortByFrequency() {
    this.rhymes = this.rhymes.sort((a, b) => a.averageFrequency - b.averageFrequency);
  }

  separateSelf() {
    // if word is the same as hanzi, filter out word from rhymes and set as self
    var newRhymes = [];
    this.rhymes.forEach(word => {
      if (word.simplified == this.hanzi || word.traditional == this.hanzi) {
        this.self = word;
      } else {
        newRhymes.push(word);
      }
    });
    this.rhymes = newRhymes;
  }

  withToneMatching() {
    this.matchTones = true;
    // return this to enable chaining;
    return this;
  }
}

module.exports = MandarinRhymes;
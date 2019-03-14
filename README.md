# Mandarin Rhymes

>A rhyming dictionary tool for Mandarin Chinese

## Background

Given a search phrase comprised of Chinese Characters, finds a list of rhyming words from entries in the CC-CEDICT. Rhyming is determined using the final vowel sound of each syllable in the word. Additionally, an option is provided to find only rhyming words which also match the tones of the search phrase.


## Install

  `$ npm install --save mandarin-rhymes`


## Usage

```javascript
const MandarinRhymes = require('mandarin-rhymes')
var rhyme = new MandarinRhymes('能力');
```
### Without Tone Matching
```javascript
rhyme.getRhymes().then(console.log);
/*
{
  "self": {
    "simplified": "能力",
    "traditional": "能力",
    "pinyin": "néng lì",
    "zhuyinArray": ["ㄋㄥˊ", "ㄌㄧ`"],
    "definitions": ["capability", "ability", "CL:個|个[ge4]"],
    "toneNumberArray": ["2", "4"],
    "averageFrequency": 70.5
  },
  "rhymes": [{
    "simplified": "争气",
    "traditional": "爭氣",
    "pinyin": "zhēng qì",
    "zhuyinArray": ["ㄓㄥ", "ㄑㄧ`"],
    "definitions": ["to work hard for sth", "to resolve on improvement", "determined not to fall short"],
    "toneNumberArray": ["1", "4"],
    "averageFrequency": 70.5
  }...]
}
*/
```
### With Tone Matching
```javascript
rhyme.withToneMatching().getRhymes().then(console.log);
/*
{
  "self": {
    "simplified": "能力",
    "traditional": "能力",
    "pinyin": "néng lì",
    "zhuyinArray": ["ㄋㄥˊ", "ㄌㄧ`"],
    "definitions": ["capability", "ability", "CL:個|个[ge4]"],
    "toneNumberArray": ["2", "4"],
    "averageFrequency": 70.5
  },
  "rhymes": [{
    "simplified": "乘隙",
    "traditional": "乘隙",
    "pinyin": "chéng xì",
    "zhuyinArray": ["ㄔㄥˊ", "ㄒㄧ`"],
    "definitions": ["to seize an opportunity", "to exploit (a loophole)"],
    "toneNumberArray": ["2", "4"],
    "averageFrequency": 70.5
  }...]
}
*/
```
## API

```js
const MandarinRhymes = require('mandarin-rhymes')
```

### Constructor


##### MandarinRhymes(hanzi)
Constructs a `MandarinRhymes` object using the given `hanzi` as a search phrase.
`hanzi` must consist only of Chinese characters.

### Methods

##### getRhymes()
Returns an array of objects representing words that rhyme with the hanzi passed to the constructor, sorted by averageFrequency in ascending order
Each object has the following fields:
* `simplified`: The Simplified Chinese characters for the word
* `traditional`: The Traditional Chinese characters for the word
* `pinyin`: The pinyin for the word given with diacritic tone markings
* `zhuyinArray`: An array of the zhuyin for each syllable of the word with tone markings
* `definitions`: An array of definitions for the word
* `toneNumberArray`: An array of Tone Numbers
* `averageFrequency`: An average of the frequency rank of each of the characters in the  word, where a lower rank corresponds to a more frequently used word

##### withMatchingTones()
Flags the next call to `getRhymes()` to only return words which match the tones of the hanzi passed to the constructor.

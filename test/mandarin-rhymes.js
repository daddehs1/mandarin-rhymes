const MandarinRhymes = require('../index');
var expect = require('chai').expect;

describe('getRhymes', () => {

  context('find rhymes for 能力 with matching tones', () => {
    const mandarinRhymes = new MandarinRhymes("能力");
    it('should not find 生气 as a match', (done) => {
      mandarinRhymes.withToneMatching().getRhymes().then(rhymeData => {
        const filteredRhymes = rhymeData.rhymes.filter((rhyme) => rhyme.simplified === '生气');
        expect(filteredRhymes.length).to.equal(0);
        done();
      }).catch(err => {
        throw err;
        done();
      })
    })

    it('should find 成绩 as a match', (done) => {
      mandarinRhymes.withToneMatching().getRhymes().then(rhymeData => {
        const filteredRhymes = rhymeData.rhymes.filter((rhyme) => rhyme.simplified === '成绩');
        expect(filteredRhymes.length).to.equal(1);
        done();
      }).catch(err => {
        throw err;
        done();
      })
    })
  })

  context('find rhymes for 能力 without matching tones', () => {
    const mandarinRhymes = new MandarinRhymes("能力");
    it('should find 生气 as a match', (done) => {
      mandarinRhymes.getRhymes().then(rhymeData => {
        const filteredRhymes = rhymeData.rhymes.filter((rhyme) => rhyme.simplified === '生气');
        expect(filteredRhymes.length).to.equal(1);
        done();
      }).catch(err => {
        throw err;
        done();
      })
    })

    it('should find 成绩 as a match', (done) => {
      mandarinRhymes.getRhymes().then(rhymeData => {
        const filteredRhymes = rhymeData.rhymes.filter((rhyme) => rhyme.simplified === '成绩');
        expect(filteredRhymes.length).to.equal(1);
        done();
      }).catch(err => {
        throw err;
        done();
      })
    })
  })

  context('find rhymes for 应该是的 with matching tones', () => {
    const mandarinRhymes = new MandarinRhymes("应该是空的");
    it('should find no matches', (done) => {
      mandarinRhymes.withToneMatching().getRhymes().then(rhymeData => {
        expect(rhymeData.rhymes.length).to.equal(0);
        done();
      })
    })
  })

  context('find rhymes for 应该是的 without matching tones', () => {
    const mandarinRhymes = new MandarinRhymes("应该是空的");
    it('should find no matches', (done) => {
      mandarinRhymes.getRhymes().then(rhymeData => {
        expect(rhymeData.rhymes.length).to.equal(0);
        done();
      })
    })
  })
})
import { expect, test } from '@oclif/test';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as open from '../../src/wrappers/open';

chai.should();
chai.use(sinonChai);

describe('open', () => {
  const openStub = sinon.spy();

  before(() => {
    sinon.replace(open, 'open', openStub);
  });

  after(() => {
    sinon.restore();
  });

  test
    .stdout()
    .command(['open'])
    .it('runs open', (ctx) => {
      const expectedUrl = 'https://github.com/mtusk/gite';

      expect(ctx.stdout).to.contain(`Opening '${expectedUrl}' in your default browser...`);
      expect(openStub).to.have.been.calledWith(expectedUrl);
    });
});

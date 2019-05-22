import * as openExt from 'open';

// the 'open' npm package exports a function
// which makes stubbing difficult with sinon
// so wrap it to make this easier

export const open = (target: string, options?: openExt.Options) => {
  return openExt(target, options);
};

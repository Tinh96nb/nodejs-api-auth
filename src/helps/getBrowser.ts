import * as useragent from 'useragent';

export function getBrowser(req : any) {
  const agent : any= useragent.is(req.headers['user-agent'])
  let browser: string;
  Object.keys(agent).forEach(function(key) {
    if (agent[key] === true && key!== 'webkit') {
      browser = key;
      return;
    }
  })
  return browser;
}
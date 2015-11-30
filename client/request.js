import rp from 'request-promise';
import fs from 'fs';
import path from 'path';

export function get(activeWorkspace, hostname, route = '', json = null) {
  return rp(getOptions(activeWorkspace, hostname, route, 'GET', json));
}

export function post(activeWorkspace, hostname, route = '', json = null, headers = null) {
  return rp(getOptions(activeWorkspace, hostname, route, 'POST', null, json, headers));
}

export function put(activeWorkspace, hostname, route = '', json = null) {
  //return request(activeWorkspace, hostname, route, json, 'PUT');
}

export function remove(activeWorkspace, hostname, route = '', json = null) {
  //return request(activeWorkspace, hostname, route, json, 'DELETE');
}

function getOptions(activeWorkspace, hostname, route, method, qs = null, body = null, headers = null) {
  let options = {
    uri: hostname + route,
    method: method,
    resolveWithFullResponse: true,
    encoding: null,
    key: fs.readFileSync(path.join(__dirname, '../workspaces', activeWorkspace, '.ssl/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../workspaces', activeWorkspace, '.ssl/crt.pem')),
    ca: fs.readFileSync(path.join(__dirname, '../ca/ca-crt.pem'))
  };

  if (qs) {
    options.uri = hostname + route + '?' + Object.keys(qs).map((k) => {
      return encodeURIComponent(k) + '=' + encodeURIComponent(qs[k]);
    }).join('&');
  }

  if (body) options.body = JSON.stringify(body);
  if (headers) options.headers = headers;
  return options;
}

const {
  validateNativeMessage, validateHostMessage,
  rpcStatus, connectMsg, setActivityMsg, disconnectMsg,
} = require('../shared/rpc-protocol');

let passed = 0;
let failed = 0;

function assert(label, ok, detail) {
  const status = ok ? 'PASS' : 'FAIL';
  console.error(`  ${status}  ${label}${detail ? ': ' + detail : ''}`);
  if (ok) passed++; else failed++;
}

assert('connectMsg returns correct action', connectMsg('abc').action === 'connect', connectMsg('abc').action);
assert('connectMsg carries clientId', connectMsg('abc').clientId === 'abc', connectMsg('abc').clientId);

assert('setActivityMsg returns correct action', setActivityMsg({ details: 'test' }).action === 'setActivity');
assert('setActivityMsg carries presence', setActivityMsg({ details: 'test' }).presence.details === 'test');

assert('disconnectMsg returns correct action', disconnectMsg().action === 'disconnect');

assert('rpcStatus(true) has type and connected', rpcStatus(true).type === 'rpcStatus' && rpcStatus(true).connected === true);
assert('rpcStatus(false) has connected false', rpcStatus(false).connected === false);
assert('rpcStatus with userId', rpcStatus(true, { userId: '123' }).userId === '123');
assert('rpcStatus with error', rpcStatus(false, { error: 'err' }).error === 'err');

assert('validateNativeMessage null', validateNativeMessage(null) === false);
assert('validateNativeMessage string', validateNativeMessage('foo') === false);
assert('validateNativeMessage valid connect', validateNativeMessage({ action: 'connect' }) === true);
assert('validateNativeMessage valid setActivity', validateNativeMessage({ action: 'setActivity' }) === true);
assert('validateNativeMessage valid disconnect', validateNativeMessage({ action: 'disconnect' }) === true);
assert('validateNativeMessage invalid action', validateNativeMessage({ action: 'explode' }) === false);
assert('validateNativeMessage empty object', validateNativeMessage({}) === true);

assert('validateHostMessage null', validateHostMessage(null) === false);
assert('validateHostMessage string', validateHostMessage('foo') === false);
assert('validateHostMessage rpcStatus', validateHostMessage({ type: 'rpcStatus' }) === true);
assert('validateHostMessage error', validateHostMessage({ type: 'error' }) === true);
assert('validateHostMessage invalid type', validateHostMessage({ type: 'pong' }) === false);
assert('validateHostMessage empty object', validateHostMessage({}) === true);

console.error(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);

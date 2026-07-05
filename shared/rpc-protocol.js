const ACTION_CONNECT = 'connect';
const ACTION_SET_ACTIVITY = 'setActivity';
const ACTION_DISCONNECT = 'disconnect';

const TYPE_RPC_STATUS = 'rpcStatus';
const TYPE_ERROR = 'error';

const VALID_ACTIONS = [ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT];
const VALID_TYPES = [TYPE_RPC_STATUS, TYPE_ERROR];

function validateNativeMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.action && !VALID_ACTIONS.includes(msg.action)) return false;
  return true;
}

function validateHostMessage(msg) {
  if (!msg || typeof msg !== 'object') return false;
  if (msg.type && !VALID_TYPES.includes(msg.type)) return false;
  return true;
}

function rpcStatus(connected, opts) {
  const m = { type: TYPE_RPC_STATUS, connected };
  if (opts && opts.userId) m.userId = opts.userId;
  if (opts && opts.error) m.error = opts.error;
  return m;
}

function connectMsg(clientId) {
  return { action: ACTION_CONNECT, clientId };
}

function setActivityMsg(presence) {
  return { action: ACTION_SET_ACTIVITY, presence };
}

function disconnectMsg() {
  return { action: ACTION_DISCONNECT };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ACTION_CONNECT, ACTION_SET_ACTIVITY, ACTION_DISCONNECT,
    TYPE_RPC_STATUS, TYPE_ERROR,
    validateNativeMessage, validateHostMessage,
    rpcStatus, connectMsg, setActivityMsg, disconnectMsg,
  };
}

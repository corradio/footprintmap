import { _ as _extends } from './extends-7477639a.js';

var createSymbol = function createSymbol(name) {
  return "@@redux-saga/" + name;
};

var CANCEL = /*#__PURE__*/createSymbol('CANCEL_PROMISE');
var CHANNEL_END_TYPE = /*#__PURE__*/createSymbol('CHANNEL_END');
var IO = /*#__PURE__*/createSymbol('IO');
var MATCH = /*#__PURE__*/createSymbol('MATCH');
var MULTICAST = /*#__PURE__*/createSymbol('MULTICAST');
var SAGA_ACTION = /*#__PURE__*/createSymbol('SAGA_ACTION');
var SELF_CANCELLATION = /*#__PURE__*/createSymbol('SELF_CANCELLATION');
var TASK = /*#__PURE__*/createSymbol('TASK');
var TASK_CANCEL = /*#__PURE__*/createSymbol('TASK_CANCEL');
var TERMINATE = /*#__PURE__*/createSymbol('TERMINATE');
var SAGA_LOCATION = /*#__PURE__*/createSymbol('LOCATION');

var undef = function undef(v) {
  return v === null || v === undefined;
};

var notUndef = function notUndef(v) {
  return v !== null && v !== undefined;
};

var func = function func(f) {
  return typeof f === 'function';
};

var string = function string(s) {
  return typeof s === 'string';
};

var array = Array.isArray;

var promise = function promise(p) {
  return p && func(p.then);
};

var iterator = function iterator(it) {
  return it && func(it.next) && func(it.throw);
};

var pattern = function pattern(pat) {
  return pat && (string(pat) || symbol(pat) || func(pat) || array(pat) && pat.every(pattern));
};

var channel = function channel(ch) {
  return ch && func(ch.take) && func(ch.close);
};

var stringableFunc = function stringableFunc(f) {
  return func(f) && f.hasOwnProperty('toString');
};

var symbol = function symbol(sym) {
  return Boolean(sym) && typeof Symbol === 'function' && sym.constructor === Symbol && sym !== Symbol.prototype;
};

var multicast = function multicast(ch) {
  return channel(ch) && ch[MULTICAST];
};

function delayP(ms, val) {
  if (val === void 0) {
    val = true;
  }

  var timeoutId;
  var promise = new Promise(function (resolve) {
    timeoutId = setTimeout(resolve, ms, val);
  });

  promise[CANCEL] = function () {
    clearTimeout(timeoutId);
  };

  return promise;
}

var konst = function konst(v) {
  return function () {
    return v;
  };
};

var kTrue = /*#__PURE__*/konst(true);

var noop = function noop() {};

var identity = function identity(v) {
  return v;
};

var assignWithSymbols = function assignWithSymbols(target, source) {
  _extends(target, source);

  if (Object.getOwnPropertySymbols) {
    Object.getOwnPropertySymbols(source).forEach(function (s) {
      target[s] = source[s];
    });
  }
};

var flatMap = function flatMap(mapper, arr) {
  var _ref;

  return (_ref = []).concat.apply(_ref, arr.map(mapper));
};

function remove(array, item) {
  var index = array.indexOf(item);

  if (index >= 0) {
    array.splice(index, 1);
  }
}

function once(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }

    called = true;
    fn();
  };
}

var kThrow = function kThrow(err) {
  throw err;
};

var kReturn = function kReturn(value) {
  return {
    value: value,
    done: true
  };
};

function makeIterator(next, thro, name) {
  if (thro === void 0) {
    thro = kThrow;
  }

  if (name === void 0) {
    name = 'iterator';
  }

  var iterator = {
    meta: {
      name: name
    },
    next: next,
    throw: thro,
    return: kReturn,
    isSagaIterator: true
  };

  if (typeof Symbol !== 'undefined') {
    iterator[Symbol.iterator] = function () {
      return iterator;
    };
  }

  return iterator;
}

function logError(error, _ref2) {
  var sagaStack = _ref2.sagaStack;
  /*eslint-disable no-console*/

  console.error(error);
  console.error(sagaStack);
}

var createEmptyArray = function createEmptyArray(n) {
  return Array.apply(null, new Array(n));
};

var wrapSagaDispatch = function wrapSagaDispatch(dispatch) {
  return function (action) {

    return dispatch(Object.defineProperty(action, SAGA_ACTION, {
      value: true
    }));
  };
};

var shouldTerminate = function shouldTerminate(res) {
  return res === TERMINATE;
};

var shouldCancel = function shouldCancel(res) {
  return res === TASK_CANCEL;
};

var shouldComplete = function shouldComplete(res) {
  return shouldTerminate(res) || shouldCancel(res);
};

function createAllStyleChildCallbacks(shape, parentCallback) {
  var keys = Object.keys(shape);
  var totalCount = keys.length;

  var completedCount = 0;
  var completed;
  var results = array(shape) ? createEmptyArray(totalCount) : {};
  var childCallbacks = {};

  function checkEnd() {
    if (completedCount === totalCount) {
      completed = true;
      parentCallback(results);
    }
  }

  keys.forEach(function (key) {
    var chCbAtKey = function chCbAtKey(res, isErr) {
      if (completed) {
        return;
      }

      if (isErr || shouldComplete(res)) {
        parentCallback.cancel();
        parentCallback(res, isErr);
      } else {
        results[key] = res;
        completedCount++;
        checkEnd();
      }
    };

    chCbAtKey.cancel = noop;
    childCallbacks[key] = chCbAtKey;
  });

  parentCallback.cancel = function () {
    if (!completed) {
      completed = true;
      keys.forEach(function (key) {
        return childCallbacks[key].cancel();
      });
    }
  };

  return childCallbacks;
}

function getMetaInfo(fn) {
  return {
    name: fn.name || 'anonymous',
    location: getLocation(fn)
  };
}

function getLocation(instrumented) {
  return instrumented[SAGA_LOCATION];
}

var BUFFER_OVERFLOW = "Channel's Buffer overflow!";
var ON_OVERFLOW_THROW = 1;
var ON_OVERFLOW_SLIDE = 3;
var ON_OVERFLOW_EXPAND = 4;

function ringBuffer(limit, overflowAction) {
  if (limit === void 0) {
    limit = 10;
  }

  var arr = new Array(limit);
  var length = 0;
  var pushIndex = 0;
  var popIndex = 0;

  var push = function push(it) {
    arr[pushIndex] = it;
    pushIndex = (pushIndex + 1) % limit;
    length++;
  };

  var take = function take() {
    if (length != 0) {
      var it = arr[popIndex];
      arr[popIndex] = null;
      length--;
      popIndex = (popIndex + 1) % limit;
      return it;
    }
  };

  var flush = function flush() {
    var items = [];

    while (length) {
      items.push(take());
    }

    return items;
  };

  return {
    isEmpty: function isEmpty() {
      return length == 0;
    },
    put: function put(it) {
      if (length < limit) {
        push(it);
      } else {
        var doubledLimit;

        switch (overflowAction) {
          case ON_OVERFLOW_THROW:
            throw new Error(BUFFER_OVERFLOW);

          case ON_OVERFLOW_SLIDE:
            arr[pushIndex] = it;
            pushIndex = (pushIndex + 1) % limit;
            popIndex = pushIndex;
            break;

          case ON_OVERFLOW_EXPAND:
            doubledLimit = 2 * limit;
            arr = flush();
            length = arr.length;
            pushIndex = arr.length;
            popIndex = 0;
            arr.length = doubledLimit;
            limit = doubledLimit;
            push(it);
            break;

        }
      }
    },
    take: take,
    flush: flush
  };
}

var sliding = function sliding(limit) {
  return ringBuffer(limit, ON_OVERFLOW_SLIDE);
};

var expanding = function expanding(initialSize) {
  return ringBuffer(initialSize, ON_OVERFLOW_EXPAND);
};
var TAKE = 'TAKE';
var PUT = 'PUT';
var ALL = 'ALL';
var RACE = 'RACE';
var CALL = 'CALL';
var CPS = 'CPS';
var FORK = 'FORK';
var JOIN = 'JOIN';
var CANCEL$1 = 'CANCEL';
var SELECT = 'SELECT';
var ACTION_CHANNEL = 'ACTION_CHANNEL';
var CANCELLED = 'CANCELLED';
var FLUSH = 'FLUSH';
var GET_CONTEXT = 'GET_CONTEXT';
var SET_CONTEXT = 'SET_CONTEXT';
var effectTypes = /*#__PURE__*/Object.freeze({
  __proto__: null,
  TAKE: TAKE,
  PUT: PUT,
  ALL: ALL,
  RACE: RACE,
  CALL: CALL,
  CPS: CPS,
  FORK: FORK,
  JOIN: JOIN,
  CANCEL: CANCEL$1,
  SELECT: SELECT,
  ACTION_CHANNEL: ACTION_CHANNEL,
  CANCELLED: CANCELLED,
  FLUSH: FLUSH,
  GET_CONTEXT: GET_CONTEXT,
  SET_CONTEXT: SET_CONTEXT
});

var makeEffect = function makeEffect(type, payload) {
  var _ref;

  return _ref = {}, _ref[IO] = true, _ref.combinator = false, _ref.type = type, _ref.payload = payload, _ref;
};

var detach = function detach(eff) {

  return makeEffect(FORK, _extends({}, eff.payload, {
    detached: true
  }));
};

function take(patternOrChannel, multicastPattern) {
  if (patternOrChannel === void 0) {
    patternOrChannel = '*';
  }

  if (pattern(patternOrChannel)) {
    return makeEffect(TAKE, {
      pattern: patternOrChannel
    });
  }

  if (multicast(patternOrChannel) && notUndef(multicastPattern) && pattern(multicastPattern)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel,
      pattern: multicastPattern
    });
  }

  if (channel(patternOrChannel)) {
    return makeEffect(TAKE, {
      channel: patternOrChannel
    });
  }
}

var takeMaybe = function takeMaybe() {
  var eff = take.apply(void 0, arguments);
  eff.payload.maybe = true;
  return eff;
};

function put(channel$1, action) {

  if (undef(action)) {
    action = channel$1; // `undefined` instead of `null` to make default parameter work

    channel$1 = undefined;
  }

  return makeEffect(PUT, {
    channel: channel$1,
    action: action
  });
}

var putResolve = function putResolve() {
  var eff = put.apply(void 0, arguments);
  eff.payload.resolve = true;
  return eff;
};

function all(effects) {
  var eff = makeEffect(ALL, effects);
  eff.combinator = true;
  return eff;
}

function race(effects) {
  var eff = makeEffect(RACE, effects);
  eff.combinator = true;
  return eff;
} // this match getFnCallDescriptor logic

function getFnCallDescriptor(fnDescriptor, args) {
  var context = null;
  var fn;

  if (func(fnDescriptor)) {
    fn = fnDescriptor;
  } else {
    if (array(fnDescriptor)) {
      context = fnDescriptor[0];
      fn = fnDescriptor[1];
    } else {
      context = fnDescriptor.context;
      fn = fnDescriptor.fn;
    }

    if (context && string(fn) && func(context[fn])) {
      fn = context[fn];
    }
  }

  return {
    context: context,
    fn: fn,
    args: args
  };
}

function call(fnDescriptor) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return makeEffect(CALL, getFnCallDescriptor(fnDescriptor, args));
}

function apply(context, fn, args) {
  if (args === void 0) {
    args = [];
  }

  return makeEffect(CALL, getFnCallDescriptor([context, fn], args));
}

function cps(fnDescriptor) {

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  return makeEffect(CPS, getFnCallDescriptor(fnDescriptor, args));
}

function fork(fnDescriptor) {

  for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    args[_key3 - 1] = arguments[_key3];
  }

  return makeEffect(FORK, getFnCallDescriptor(fnDescriptor, args));
}

function spawn(fnDescriptor) {

  for (var _len4 = arguments.length, args = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
    args[_key4 - 1] = arguments[_key4];
  }

  return detach(fork.apply(void 0, [fnDescriptor].concat(args)));
}

function join(taskOrTasks) {

  return makeEffect(JOIN, taskOrTasks);
}

function cancel(taskOrTasks) {
  if (taskOrTasks === void 0) {
    taskOrTasks = SELF_CANCELLATION;
  }

  return makeEffect(CANCEL$1, taskOrTasks);
}

function select(selector) {
  if (selector === void 0) {
    selector = identity;
  }

  for (var _len5 = arguments.length, args = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
    args[_key5 - 1] = arguments[_key5];
  }

  return makeEffect(SELECT, {
    selector: selector,
    args: args
  });
}
/**
  channel(pattern, [buffer])    => creates a proxy channel for store actions
**/


function actionChannel(pattern$1, buffer$1) {

  return makeEffect(ACTION_CHANNEL, {
    pattern: pattern$1,
    buffer: buffer$1
  });
}

function cancelled() {
  return makeEffect(CANCELLED, {});
}

function flush(channel$1) {

  return makeEffect(FLUSH, channel$1);
}

function getContext(prop) {

  return makeEffect(GET_CONTEXT, prop);
}

function setContext(props) {

  return makeEffect(SET_CONTEXT, props);
}

var delay = /*#__PURE__*/call.bind(null, delayP);

export { call as $, ALL as A, string as B, CALL as C, stringableFunc as D, symbol as E, FORK as F, GET_CONTEXT as G, expanding as H, IO as I, JOIN as J, remove as K, CANCEL as L, MULTICAST as M, makeIterator as N, TERMINATE as O, PUT as P, TASK as Q, RACE as R, SELECT as S, TAKE as T, shouldComplete as U, wrapSagaDispatch as V, flatMap as W, logError as X, identity as Y, getLocation as Z, fork as _, CPS as a, take as a0, actionChannel as a1, sliding as a2, delay as a3, race as a4, channel as a5, cancel as a6, all as a7, apply as a8, cancelled as a9, cps as aa, effectTypes as ab, flush as ac, getContext as ad, join as ae, put as af, putResolve as ag, select as ah, setContext as ai, spawn as aj, takeMaybe as ak, CANCEL$1 as b, ACTION_CHANNEL as c, CANCELLED as d, FLUSH as e, SET_CONTEXT as f, CHANNEL_END_TYPE as g, MATCH as h, SAGA_ACTION as i, iterator as j, kTrue as k, getMetaInfo as l, array as m, notUndef as n, once as o, promise as p, createAllStyleChildCallbacks as q, SELF_CANCELLATION as r, createEmptyArray as s, assignWithSymbols as t, undef as u, shouldCancel as v, func as w, TASK_CANCEL as x, shouldTerminate as y, noop as z };

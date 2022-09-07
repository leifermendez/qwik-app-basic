/**
 * @license
 * @builder.io/qwik 0.0.107
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
const qDev$1 = globalThis.qDev === true;
const qDynamicPlatform = globalThis.qDynamicPlatform !== false;
const qTest = globalThis.qTest === true;
const EMPTY_ARRAY = [];
const EMPTY_OBJ = {};
if (qDev$1) {
  Object.freeze(EMPTY_ARRAY);
  Object.freeze(EMPTY_OBJ);
  Error.stackTraceLimit = 9999;
}
function assertDefined(value, text, ...parts) {
  if (qDev$1) {
    if (value != null)
      return;
    throw logErrorAndStop(text, ...parts);
  }
}
function assertEqual(value1, value2, text, ...parts) {
  if (qDev$1) {
    if (value1 === value2)
      return;
    throw logErrorAndStop(text, ...parts);
  }
}
function assertTrue(value1, text, ...parts) {
  if (qDev$1) {
    if (value1 === true)
      return;
    throw logErrorAndStop(text, ...parts);
  }
}
const isSerializableObject = (v) => {
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
};
const isObject = (v) => {
  return v && typeof v === "object";
};
const isArray = (v) => {
  return Array.isArray(v);
};
const isString = (v) => {
  return typeof v === "string";
};
const isFunction = (v) => {
  return typeof v === "function";
};
const OnRenderProp = "q:renderFn";
const ComponentStylesPrefixContent = "\u2B50\uFE0F";
const QSlot = "q:slot";
const QSlotRef = "q:sref";
const QSlotName = "q:sname";
const QStyle = "q:style";
const QScopedStyle = "q:sstyle";
const QContainerAttr = "q:container";
const QContainerSelector = "[q\\:container]";
const RenderEvent = "qRender";
const ELEMENT_ID = "q:id";
const ELEMENT_ID_PREFIX = "#";
const getDocument = (node) => {
  if (typeof document !== "undefined") {
    return document;
  }
  if (node.nodeType === 9) {
    return node;
  }
  const doc = node.ownerDocument;
  assertDefined(doc, "doc must be defined");
  return doc;
};
let _context;
const CONTAINER = Symbol("container");
const tryGetInvokeContext = () => {
  if (!_context) {
    const context = typeof document !== "undefined" && document && document.__q_context__;
    if (!context) {
      return void 0;
    }
    if (isArray(context)) {
      const element = context[0];
      return document.__q_context__ = newInvokeContext(getDocument(element), void 0, element, context[1], context[2]);
    }
    return context;
  }
  return _context;
};
const getInvokeContext = () => {
  const ctx = tryGetInvokeContext();
  if (!ctx) {
    throw qError(QError_useMethodOutsideContext);
  }
  return ctx;
};
const useInvokeContext = () => {
  const ctx = getInvokeContext();
  if (ctx.$event$ !== RenderEvent) {
    throw qError(QError_useInvokeContext);
  }
  assertDefined(ctx.$hostElement$, `invoke: $hostElement$ must be defined`, ctx);
  assertDefined(ctx.$waitOn$, `invoke: $waitOn$ must be defined`, ctx);
  assertDefined(ctx.$renderCtx$, `invoke: $renderCtx$ must be defined`, ctx);
  assertDefined(ctx.$doc$, `invoke: $doc$ must be defined`, ctx);
  assertDefined(ctx.$subscriber$, `invoke: $subscriber$ must be defined`, ctx);
  return ctx;
};
const invoke = (context, fn, ...args) => {
  const previousContext = _context;
  let returnValue;
  try {
    _context = context;
    returnValue = fn.apply(null, args);
  } finally {
    _context = previousContext;
  }
  return returnValue;
};
const waitAndRun = (ctx, callback) => {
  const previousWait = ctx.$waitOn$.slice();
  ctx.$waitOn$.push(Promise.allSettled(previousWait).then(callback));
};
const newInvokeContext = (doc, hostElement, element, event, url) => {
  return {
    $seq$: 0,
    $doc$: doc,
    $hostElement$: hostElement,
    $element$: element,
    $event$: event,
    $url$: url || null,
    $qrl$: void 0
  };
};
const getContainer = (el) => {
  let container = el[CONTAINER];
  if (!container) {
    container = el.closest(QContainerSelector);
    el[CONTAINER] = container;
  }
  return container;
};
const isNode$1 = (value) => {
  return value && typeof value.nodeType == "number";
};
const isDocument = (value) => {
  return value && value.nodeType === 9;
};
const isElement$1 = (value) => {
  return isNode$1(value) && value.nodeType === 1;
};
const isQwikElement = (value) => {
  return isNode$1(value) && (value.nodeType === 1 || value.nodeType === 111);
};
const isVirtualElement = (value) => {
  return isObject(value) && value.nodeType === 111;
};
const isPromise = (value) => {
  return value instanceof Promise;
};
const safeCall = (call, thenFn, rejectFn) => {
  try {
    const promise = call();
    if (isPromise(promise)) {
      return promise.then(thenFn, rejectFn);
    } else {
      return thenFn(promise);
    }
  } catch (e) {
    return rejectFn(e);
  }
};
const then = (promise, thenFn) => {
  return isPromise(promise) ? promise.then(thenFn) : thenFn(promise);
};
const promiseAll = (promises) => {
  const hasPromise = promises.some(isPromise);
  if (hasPromise) {
    return Promise.all(promises);
  }
  return promises;
};
const isNotNullable = (v) => {
  return v != null;
};
const delay = (timeout) => {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
const createPlatform$1 = (doc) => {
  const moduleCache = /* @__PURE__ */ new Map();
  return {
    isServer: false,
    importSymbol(element, url, symbolName) {
      const urlDoc = toUrl$1(doc, element, url).toString();
      const urlCopy = new URL(urlDoc);
      urlCopy.hash = "";
      urlCopy.search = "";
      const importURL = urlCopy.href;
      const mod = moduleCache.get(importURL);
      if (mod) {
        return mod[symbolName];
      }
      return import(
        /* @vite-ignore */
        importURL
      ).then((mod2) => {
        mod2 = findModule(mod2);
        moduleCache.set(importURL, mod2);
        return mod2[symbolName];
      });
    },
    raf: (fn) => {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve(fn());
        });
      });
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol() {
      return void 0;
    }
  };
};
const findModule = (module) => {
  return Object.values(module).find(isModule) || module;
};
const isModule = (module) => {
  return isObject(module) && module[Symbol.toStringTag] === "Module";
};
const toUrl$1 = (doc, element, url) => {
  var _a2;
  const containerEl = getContainer(element);
  const base = new URL((_a2 = containerEl == null ? void 0 : containerEl.getAttribute("q:base")) != null ? _a2 : doc.baseURI, doc.baseURI);
  return new URL(url, base);
};
const setPlatform = (doc, plt) => doc[DocumentPlatform] = plt;
const getPlatform = (docOrNode) => {
  const doc = getDocument(docOrNode);
  return doc[DocumentPlatform] || (doc[DocumentPlatform] = createPlatform$1(doc));
};
const isServer = (ctx) => {
  var _a2, _b;
  if (qDynamicPlatform) {
    return (_b = (_a2 = ctx.$renderCtx$) == null ? void 0 : _a2.$containerState$.$platform$.isServer) != null ? _b : getPlatform(ctx.$doc$).isServer;
  }
  return false;
};
const DocumentPlatform = ":platform:";
const ON_PROP_REGEX = /^(window:|document:|)on([A-Z]|-.).*\$$/;
const isOnProp = (prop) => {
  return ON_PROP_REGEX.test(prop);
};
const addQRLListener = (ctx, prop, input) => {
  if (!input) {
    return void 0;
  }
  const value = isArray(input) ? input.map(ensureQrl) : ensureQrl(input);
  if (!ctx.$listeners$) {
    ctx.$listeners$ = /* @__PURE__ */ new Map();
  }
  let existingListeners = ctx.$listeners$.get(prop);
  if (!existingListeners) {
    ctx.$listeners$.set(prop, existingListeners = []);
  }
  const newQRLs = isArray(value) ? value : [value];
  for (const value2 of newQRLs) {
    const cp = value2.$copy$();
    cp.$setContainer$(ctx.$element$);
    for (let i = 0; i < existingListeners.length; i++) {
      const qrl = existingListeners[i];
      if (isSameQRL(qrl, cp)) {
        existingListeners.splice(i, 1);
        i--;
      }
    }
    existingListeners.push(cp);
  }
  return existingListeners;
};
const ensureQrl = (value) => {
  return isQrl$1(value) ? value : $(value);
};
const getDomListeners = (el) => {
  const attributes = el.attributes;
  const listeners = /* @__PURE__ */ new Map();
  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes.item(i);
    if (name.startsWith("on:") || name.startsWith("on-window:") || name.startsWith("on-document:")) {
      let array = listeners.get(name);
      if (!array) {
        listeners.set(name, array = []);
      }
      array.push(parseQRL(value, el));
    }
  }
  return listeners;
};
const useSequentialScope = () => {
  const ctx = useInvokeContext();
  const i = ctx.$seq$;
  const hostElement = ctx.$hostElement$;
  const elementCtx = getContext(hostElement);
  ctx.$seq$++;
  const set = (value) => {
    if (qDev$1) {
      verifySerializable(value);
    }
    return elementCtx.$seq$[i] = value;
  };
  return {
    get: elementCtx.$seq$[i],
    set,
    i,
    ctx
  };
};
const useOn = (event, eventQrl) => _useOn(`on:${event}`, eventQrl);
const _useOn = (eventName, eventQrl) => {
  const invokeCtx = useInvokeContext();
  const ctx = getContext(invokeCtx.$hostElement$);
  assertQrl(eventQrl);
  addQRLListener(ctx, eventName, eventQrl);
};
const emitEvent = (el, eventName, detail, bubbles) => {
  if (el && typeof CustomEvent === "function") {
    el.dispatchEvent(new CustomEvent(eventName, {
      detail,
      bubbles,
      composed: bubbles
    }));
  }
};
const directSetAttribute = (el, prop, value) => {
  return el.setAttribute(prop, value);
};
const directGetAttribute = (el, prop) => {
  return el.getAttribute(prop);
};
const fromCamelToKebabCase = (text) => {
  return text.replace(/([A-Z])/g, "-$1").toLowerCase();
};
const jsx = (type, props, key) => {
  if (qDev$1) {
    if (!isString(type) && !isFunction(type)) {
      throw qError(QError_invalidJsxNodeType, type);
    }
  }
  return new JSXNodeImpl(type, props, key);
};
const HOST_TYPE = ":host";
const SKIP_RENDER_TYPE = ":skipRender";
const VIRTUAL_TYPE = ":virtual";
class JSXNodeImpl {
  constructor(type, props, key = null) {
    this.type = type;
    this.props = props;
    this.key = key;
  }
}
const isJSXNode = (n) => {
  if (qDev$1) {
    if (n instanceof JSXNodeImpl) {
      return true;
    }
    if (isObject(n) && "key" in n && "props" in n && "type" in n) {
      logWarn(`Duplicate implementations of "JSXNode" found`);
      return true;
    }
    return false;
  } else {
    return n instanceof JSXNodeImpl;
  }
};
const Fragment = (props) => props.children;
const SkipRerender = (props) => props.children;
const SSRComment = () => null;
const Virtual = (props) => props.children;
const executeComponent = (rctx, ctx) => {
  ctx.$dirty$ = false;
  ctx.$mounted$ = true;
  const hostElement = ctx.$element$;
  const onRenderQRL = ctx.$renderQrl$;
  assertDefined(onRenderQRL, `render: host element to render must has a $renderQrl$:`, ctx);
  const props = ctx.$props$;
  assertDefined(props, `render: host element to render must has defined props`, ctx);
  rctx.$containerState$.$hostsStaging$.delete(hostElement);
  const newCtx = copyRenderContext(rctx);
  const invocatinContext = newInvokeContext(rctx.$doc$, hostElement, void 0, RenderEvent);
  invocatinContext.$subscriber$ = hostElement;
  invocatinContext.$renderCtx$ = newCtx;
  const waitOn = invocatinContext.$waitOn$ = [];
  rctx.$containerState$.$subsManager$.$clearSub$(hostElement);
  const onRenderFn = onRenderQRL.$invokeFn$(rctx.$containerEl$, invocatinContext);
  return safeCall(() => onRenderFn(props), (jsxNode) => {
    rctx.$hostElements$.add(hostElement);
    const waitOnPromise = promiseAll(waitOn);
    return then(waitOnPromise, () => {
      if (isFunction(jsxNode)) {
        ctx.$dirty$ = false;
        jsxNode = jsxNode();
      } else if (ctx.$dirty$) {
        return executeComponent(rctx, ctx);
      }
      let componentCtx = ctx.$component$;
      if (!componentCtx) {
        componentCtx = ctx.$component$ = {
          $ctx$: ctx,
          $slots$: [],
          $attachedListeners$: false
        };
      }
      componentCtx.$attachedListeners$ = false;
      componentCtx.$slots$ = [];
      newCtx.$localStack$.push(ctx);
      newCtx.$currentComponent$ = componentCtx;
      return {
        node: jsxNode,
        rctx: newCtx
      };
    });
  }, (err) => {
    logError(err);
  });
};
const createRenderContext = (doc, containerState) => {
  const ctx = {
    $doc$: doc,
    $containerState$: containerState,
    $containerEl$: containerState.$containerEl$,
    $hostElements$: /* @__PURE__ */ new Set(),
    $operations$: [],
    $postOperations$: [],
    $roots$: [],
    $localStack$: [],
    $currentComponent$: void 0,
    $perf$: {
      $visited$: 0
    }
  };
  return ctx;
};
const copyRenderContext = (ctx) => {
  const newCtx = {
    ...ctx,
    $localStack$: [...ctx.$localStack$]
  };
  return newCtx;
};
const stringifyClass = (obj, oldValue) => {
  const oldParsed = parseClassAny(oldValue);
  const newParsed = parseClassAny(obj);
  return [...oldParsed.filter((s) => s.includes(ComponentStylesPrefixContent)), ...newParsed].join(" ");
};
const joinClasses = (...input) => {
  const set = /* @__PURE__ */ new Set();
  input.forEach((value) => {
    parseClassAny(value).forEach((v) => set.add(v));
  });
  return Array.from(set).join(" ");
};
const parseClassAny = (obj) => {
  if (isString(obj)) {
    return parseClassList(obj);
  } else if (isObject(obj)) {
    if (isArray(obj)) {
      return obj;
    } else {
      const output = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value) {
            output.push(key);
          }
        }
      }
      return output;
    }
  }
  return [];
};
const parseClassListRegex = /\s/;
const parseClassList = (value) => !value ? [] : value.split(parseClassListRegex);
const stringifyStyle = (obj) => {
  if (obj == null)
    return "";
  if (typeof obj == "object") {
    if (isArray(obj)) {
      throw qError(QError_stringifyClassOrStyle, obj, "style");
    } else {
      const chunks = [];
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value) {
            chunks.push(fromCamelToKebabCase(key) + ":" + value);
          }
        }
      }
      return chunks.join(";");
    }
  }
  return String(obj);
};
const getNextIndex = (ctx) => {
  return intToStr(ctx.$containerState$.$elementIndex$++);
};
const getQId = (el) => {
  const ctx = tryGetContext(el);
  if (ctx) {
    return ctx.$id$;
  }
  return null;
};
const setQId = (rctx, ctx) => {
  const id = getNextIndex(rctx);
  ctx.$id$ = id;
  directSetAttribute(ctx.$element$, ELEMENT_ID, id);
};
const hasStyle = (containerState, styleId) => {
  return containerState.$styleIds$.has(styleId);
};
const ALLOWS_PROPS = [QSlot];
const SKIPS_PROPS = [QSlot, OnRenderProp, "children"];
const hashCode = (text, hash = 0) => {
  if (text.length === 0)
    return hash;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0;
  }
  return Number(Math.abs(hash)).toString(36);
};
const styleKey = (qStyles, index2) => {
  return `${hashCode(qStyles.getHash())}-${index2}`;
};
const styleContent = (styleId) => {
  return ComponentStylesPrefixContent + styleId;
};
const serializeSStyle = (scopeIds) => {
  const value = scopeIds.join(" ");
  if (value.length > 0) {
    return value;
  }
  return void 0;
};
const renderComponent = (rctx, ctx, flags) => {
  const justMounted = !ctx.$mounted$;
  return then(executeComponent(rctx, ctx), (res) => {
    if (res) {
      const hostElement = ctx.$element$;
      const newCtx = res.rctx;
      const invocatinContext = newInvokeContext(rctx.$doc$, hostElement);
      invocatinContext.$subscriber$ = hostElement;
      invocatinContext.$renderCtx$ = newCtx;
      if (justMounted) {
        if (ctx.$appendStyles$) {
          for (const style2 of ctx.$appendStyles$) {
            appendHeadStyle(rctx, hostElement, style2);
          }
        }
        if (ctx.$scopeIds$) {
          const value = serializeSStyle(ctx.$scopeIds$);
          if (value) {
            directSetAttribute(hostElement, QScopedStyle, value);
          }
        }
      }
      const processedJSXNode = processData$1(res.node, invocatinContext);
      return then(processedJSXNode, (processedJSXNode2) => {
        return visitJsxNode(newCtx, hostElement, processedJSXNode2, flags);
      });
    }
  });
};
class ProcessedJSXNodeImpl {
  constructor($type$, $props$, $children$, $key$) {
    this.$type$ = $type$;
    this.$props$ = $props$;
    this.$children$ = $children$;
    this.$key$ = $key$;
    this.$elm$ = null;
    this.$text$ = "";
  }
}
const processNode = (node, invocationContext) => {
  const key = node.key != null ? String(node.key) : null;
  let textType = "";
  if (node.type === SkipRerender) {
    textType = SKIP_RENDER_TYPE;
  } else if (node.type === Virtual) {
    textType = VIRTUAL_TYPE;
  } else if (isFunction(node.type)) {
    const res = invocationContext ? invoke(invocationContext, () => node.type(node.props, node.key)) : node.type(node.props, node.key);
    return processData$1(res, invocationContext);
  } else if (isString(node.type)) {
    textType = node.type;
  } else {
    throw qError(QError_invalidJsxNodeType, node.type);
  }
  let children = EMPTY_ARRAY;
  if (node.props) {
    const mightPromise = processData$1(node.props.children, invocationContext);
    return then(mightPromise, (result) => {
      if (result !== void 0) {
        if (isArray(result)) {
          children = result;
        } else {
          children = [result];
        }
      }
      return new ProcessedJSXNodeImpl(textType, node.props, children, key);
    });
  }
  return new ProcessedJSXNodeImpl(textType, node.props, children, key);
};
const processData$1 = (node, invocationContext) => {
  if (node == null || typeof node === "boolean") {
    return void 0;
  }
  if (isJSXNode(node)) {
    return processNode(node, invocationContext);
  } else if (isPromise(node)) {
    return node.then((node2) => processData$1(node2, invocationContext));
  } else if (isArray(node)) {
    const output = promiseAll(node.flatMap((n) => processData$1(n, invocationContext)));
    return then(output, (array) => array.flat(100).filter(isNotNullable));
  } else if (isString(node) || typeof node === "number") {
    const newNode = new ProcessedJSXNodeImpl("#text", EMPTY_OBJ, EMPTY_ARRAY, null);
    newNode.$text$ = String(node);
    return newNode;
  } else {
    logWarn("A unsupported value was passed to the JSX, skipping render. Value:", node);
    return void 0;
  }
};
const VIRTUAL_SYMBOL = "__virtual";
const newVirtualElement = (doc) => {
  const open = doc.createComment("qv ");
  const close = doc.createComment("/qv");
  return createVirtualElement(open, close);
};
const parseVirtualAttributes = (str) => {
  if (!str) {
    return /* @__PURE__ */ new Map();
  }
  const attributes = str.split(" ");
  return new Map(attributes.map((attr) => {
    const index2 = attr.indexOf("=");
    if (index2 >= 0) {
      return [attr.slice(0, index2), unescape(attr.slice(index2 + 1))];
    } else {
      return [attr, ""];
    }
  }));
};
const serializeVirtualAttributes = (map) => {
  const attributes = [];
  map.forEach((value, key) => {
    if (!value) {
      attributes.push(`${key}`);
    } else {
      attributes.push(`${key}=${escape$1(value)}`);
    }
  });
  return attributes.join(" ");
};
const SHOW_COMMENT$1 = 128;
const FILTER_ACCEPT$1 = 1;
const FILTER_REJECT$1 = 2;
const walkerVirtualByAttribute = (el, prop, value) => {
  return el.ownerDocument.createTreeWalker(el, SHOW_COMMENT$1, {
    acceptNode(c) {
      const virtual = getVirtualElement(c);
      if (virtual) {
        return virtual.getAttribute(prop) === value ? FILTER_ACCEPT$1 : FILTER_REJECT$1;
      }
      return FILTER_REJECT$1;
    }
  });
};
const queryAllVirtualByAttribute = (el, prop, value) => {
  const walker = walkerVirtualByAttribute(el, prop, value);
  const pars = [];
  let currentNode = null;
  while (currentNode = walker.nextNode()) {
    pars.push(getVirtualElement(currentNode));
  }
  return pars;
};
const escape$1 = (s) => {
  return s.replace(/ /g, "+");
};
const unescape = (s) => {
  return s.replace(/\+/g, " ");
};
const createVirtualElement = (open, close) => {
  const doc = open.ownerDocument;
  const template = doc.createElement("template");
  assertTrue(open.data.startsWith("qv "), "comment is not a qv");
  const attributes = parseVirtualAttributes(open.data.slice(3));
  const insertBefore2 = (node, ref) => {
    const parent = virtual.parentElement;
    if (parent) {
      const ref2 = ref ? ref : close;
      parent.insertBefore(node, ref2);
    } else {
      template.insertBefore(node, ref);
    }
    return node;
  };
  const remove = () => {
    const parent = virtual.parentElement;
    if (parent) {
      const ch = Array.from(virtual.childNodes);
      assertEqual(template.childElementCount, 0, "children should be empty");
      parent.removeChild(open);
      template.append(...ch);
      parent.removeChild(close);
    }
  };
  const appendChild = (node) => {
    return insertBefore2(node, null);
  };
  const insertBeforeTo = (newParent, child) => {
    const ch = Array.from(virtual.childNodes);
    if (virtual.parentElement) {
      console.warn("already attached");
    }
    newParent.insertBefore(open, child);
    for (const c of ch) {
      newParent.insertBefore(c, child);
    }
    newParent.insertBefore(close, child);
    assertEqual(template.childElementCount, 0, "children should be empty");
  };
  const appendTo = (newParent) => {
    insertBeforeTo(newParent, null);
  };
  const updateComment = () => {
    open.data = `qv ${serializeVirtualAttributes(attributes)}`;
  };
  const removeChild = (child) => {
    if (virtual.parentElement) {
      virtual.parentElement.removeChild(child);
    } else {
      template.removeChild(child);
    }
  };
  const getAttribute = (prop) => {
    var _a2;
    return (_a2 = attributes.get(prop)) != null ? _a2 : null;
  };
  const hasAttribute = (prop) => {
    return attributes.has(prop);
  };
  const setAttribute2 = (prop, value) => {
    attributes.set(prop, value);
    updateComment();
  };
  const removeAttribute = (prop) => {
    attributes.delete(prop);
    updateComment();
  };
  const matches = (_) => {
    return false;
  };
  const compareDocumentPosition = (other) => {
    return open.compareDocumentPosition(other);
  };
  const closest = (query) => {
    const parent = virtual.parentElement;
    if (parent) {
      return parent.closest(query);
    }
    return null;
  };
  const querySelectorAll = (query) => {
    const result = [];
    const ch = getChildren(virtual, "elements");
    ch.forEach((el) => {
      if (isQwikElement(el)) {
        if (el.matches(query)) {
          result.push(el);
        }
        result.concat(Array.from(el.querySelectorAll(query)));
      }
    });
    return result;
  };
  const querySelector = (query) => {
    for (const el of virtual.childNodes) {
      if (isElement$1(el)) {
        if (el.matches(query)) {
          return el;
        }
        const v = el.querySelector(query);
        if (v !== null) {
          return v;
        }
      }
    }
    return null;
  };
  const virtual = {
    open,
    close,
    appendChild,
    insertBefore: insertBefore2,
    appendTo,
    insertBeforeTo,
    closest,
    remove,
    ownerDocument: open.ownerDocument,
    nodeType: 111,
    compareDocumentPosition,
    querySelectorAll,
    querySelector,
    matches,
    setAttribute: setAttribute2,
    getAttribute,
    hasAttribute,
    removeChild,
    localName: ":virtual",
    nodeName: ":virtual",
    removeAttribute,
    get firstChild() {
      if (virtual.parentElement) {
        const first = open.nextSibling;
        if (first === close) {
          return null;
        }
        return first;
      } else {
        return template.firstChild;
      }
    },
    get nextSibling() {
      return close.nextSibling;
    },
    get previousSibling() {
      return open.previousSibling;
    },
    get childNodes() {
      if (!virtual.parentElement) {
        return template.childNodes;
      }
      const nodes = [];
      let node = open;
      while (node = node.nextSibling) {
        if (node !== close) {
          nodes.push(node);
        } else {
          break;
        }
      }
      return nodes;
    },
    get isConnected() {
      return open.isConnected;
    },
    get parentElement() {
      return open.parentElement;
    }
  };
  open[VIRTUAL_SYMBOL] = virtual;
  return virtual;
};
const processVirtualNodes = (node) => {
  if (node == null) {
    return null;
  }
  if (isComment(node)) {
    const virtual = getVirtualElement(node);
    if (virtual) {
      return virtual;
    }
  }
  return node;
};
const getVirtualElement = (open) => {
  const virtual = open[VIRTUAL_SYMBOL];
  if (virtual) {
    return virtual;
  }
  if (open.data.startsWith("qv ")) {
    const close = findClose(open);
    return createVirtualElement(open, close);
  }
  return null;
};
const findClose = (open) => {
  let node = open.nextSibling;
  let stack = 1;
  while (node) {
    if (isComment(node)) {
      if (node.data.startsWith("qv ")) {
        stack++;
      } else if (node.data === "/qv") {
        stack--;
        if (stack === 0) {
          return node;
        }
      }
    }
    node = node.nextSibling;
  }
  throw new Error("close not found");
};
const isComment = (node) => {
  return node.nodeType === 8;
};
const getRootNode = (node) => {
  if (node == null) {
    return null;
  }
  if (isVirtualElement(node)) {
    return node.open;
  } else {
    return node;
  }
};
const SVG_NS = "http://www.w3.org/2000/svg";
const IS_SVG = 1 << 0;
const IS_HEAD$1 = 1 << 1;
const visitJsxNode = (ctx, elm, jsxNode, flags) => {
  if (jsxNode === void 0) {
    return smartUpdateChildren(ctx, elm, [], "root", flags);
  }
  if (isArray(jsxNode)) {
    return smartUpdateChildren(ctx, elm, jsxNode.flat(), "root", flags);
  } else {
    return smartUpdateChildren(ctx, elm, [jsxNode], "root", flags);
  }
};
const smartUpdateChildren = (ctx, elm, ch, mode, flags) => {
  if (ch.length === 1 && ch[0].$type$ === SKIP_RENDER_TYPE) {
    if (elm.firstChild !== null) {
      return;
    }
    ch = ch[0].$children$;
  }
  const isHead = elm.nodeName === "HEAD";
  if (isHead) {
    mode = "head";
    flags |= IS_HEAD$1;
  }
  const oldCh = getChildren(elm, mode);
  if (oldCh.length > 0 && ch.length > 0) {
    return updateChildren(ctx, elm, oldCh, ch, flags);
  } else if (ch.length > 0) {
    return addVnodes(ctx, elm, null, ch, 0, ch.length - 1, flags);
  } else if (oldCh.length > 0) {
    return removeVnodes(ctx, oldCh, 0, oldCh.length - 1);
  }
};
const updateChildren = (ctx, parentElm, oldCh, newCh, flags) => {
  let oldStartIdx = 0;
  let newStartIdx = 0;
  let oldEndIdx = oldCh.length - 1;
  let oldStartVnode = oldCh[0];
  let oldEndVnode = oldCh[oldEndIdx];
  let newEndIdx = newCh.length - 1;
  let newStartVnode = newCh[0];
  let newEndVnode = newCh[newEndIdx];
  let oldKeyToIdx;
  let idxInOld;
  let elmToMove;
  const results = [];
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (oldStartVnode == null) {
      oldStartVnode = oldCh[++oldStartIdx];
    } else if (oldEndVnode == null) {
      oldEndVnode = oldCh[--oldEndIdx];
    } else if (newStartVnode == null) {
      newStartVnode = newCh[++newStartIdx];
    } else if (newEndVnode == null) {
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      results.push(patchVnode(ctx, oldStartVnode, newStartVnode, flags));
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];
    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      results.push(patchVnode(ctx, oldEndVnode, newEndVnode, flags));
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      results.push(patchVnode(ctx, oldStartVnode, newEndVnode, flags));
      insertBefore(ctx, parentElm, oldStartVnode, oldEndVnode.nextSibling);
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];
    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      results.push(patchVnode(ctx, oldEndVnode, newStartVnode, flags));
      insertBefore(ctx, parentElm, oldEndVnode, oldStartVnode);
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];
    } else {
      if (oldKeyToIdx === void 0) {
        oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      }
      idxInOld = oldKeyToIdx[newStartVnode.$key$];
      if (idxInOld === void 0) {
        const newElm = createElm(ctx, newStartVnode, flags);
        results.push(then(newElm, (newElm2) => {
          insertBefore(ctx, parentElm, newElm2, oldStartVnode);
        }));
      } else {
        elmToMove = oldCh[idxInOld];
        if (!isTagName(elmToMove, newStartVnode.$type$)) {
          const newElm = createElm(ctx, newStartVnode, flags);
          results.push(then(newElm, (newElm2) => {
            insertBefore(ctx, parentElm, newElm2, oldStartVnode);
          }));
        } else {
          results.push(patchVnode(ctx, elmToMove, newStartVnode, flags));
          oldCh[idxInOld] = void 0;
          insertBefore(ctx, parentElm, elmToMove, oldStartVnode);
        }
      }
      newStartVnode = newCh[++newStartIdx];
    }
  }
  if (newStartIdx <= newEndIdx) {
    const before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].$elm$;
    results.push(addVnodes(ctx, parentElm, before, newCh, newStartIdx, newEndIdx, flags));
  }
  let wait = promiseAll(results);
  if (oldStartIdx <= oldEndIdx) {
    wait = then(wait, () => {
      removeVnodes(ctx, oldCh, oldStartIdx, oldEndIdx);
    });
  }
  return wait;
};
const isComponentNode = (node) => {
  return node.$props$ && OnRenderProp in node.$props$;
};
const getCh = (elm, filter) => {
  const end = isVirtualElement(elm) ? elm.close : null;
  const nodes = [];
  let node = elm.firstChild;
  while (node = processVirtualNodes(node)) {
    if (filter(node)) {
      nodes.push(node);
    }
    node = node.nextSibling;
    if (node === end) {
      break;
    }
  }
  return nodes;
};
const getChildren = (elm, mode) => {
  switch (mode) {
    case "root":
      return getCh(elm, isChildComponent);
    case "head":
      return getCh(elm, isHeadChildren);
    case "elements":
      return getCh(elm, isQwikElement);
  }
};
const isHeadChildren = (node) => {
  const type = node.nodeType;
  if (type === 1) {
    return node.hasAttribute("q:head");
  }
  return type === 111;
};
const isSlotTemplate = (node) => {
  return node.nodeName === "Q:TEMPLATE";
};
const isChildComponent = (node) => {
  const type = node.nodeType;
  if (type === 3 || type === 111) {
    return true;
  }
  if (type !== 1) {
    return false;
  }
  const nodeName = node.nodeName;
  if (nodeName === "Q:TEMPLATE") {
    return false;
  }
  if (nodeName === "HEAD") {
    return node.hasAttribute("q:head");
  }
  return true;
};
const splitBy = (input, condition) => {
  var _a2;
  const output = {};
  for (const item of input) {
    const key = condition(item);
    const array = (_a2 = output[key]) != null ? _a2 : output[key] = [];
    array.push(item);
  }
  return output;
};
const patchVnode = (rctx, elm, vnode, flags) => {
  vnode.$elm$ = elm;
  const tag = vnode.$type$;
  if (tag === "#text") {
    if (elm.data !== vnode.$text$) {
      setProperty$1(rctx, elm, "data", vnode.$text$);
    }
    return;
  }
  if (tag === HOST_TYPE) {
    throw qError(QError_hostCanOnlyBeAtRoot);
  }
  if (tag === SKIP_RENDER_TYPE) {
    return;
  }
  let isSvg = !!(flags & IS_SVG);
  if (!isSvg && tag === "svg") {
    flags |= IS_SVG;
    isSvg = true;
  }
  const props = vnode.$props$;
  const ctx = getContext(elm);
  const isComponent = isComponentNode(vnode);
  const isSlot = !isComponent && QSlotName in props;
  let dirty = isComponent ? updateComponentProperties$1(ctx, rctx, props) : updateProperties$1(ctx, rctx, props, isSvg);
  if (isSvg && vnode.$type$ === "foreignObject") {
    flags &= ~IS_SVG;
    isSvg = false;
  }
  if (isSlot) {
    const currentComponent = rctx.$currentComponent$;
    if (currentComponent) {
      currentComponent.$slots$.push(vnode);
    }
  }
  const ch = vnode.$children$;
  if (isComponent) {
    if (!dirty && !ctx.$renderQrl$ && !ctx.$element$.hasAttribute(ELEMENT_ID)) {
      setQId(rctx, ctx);
      ctx.$renderQrl$ = props[OnRenderProp];
      assertQrl(ctx.$renderQrl$);
      dirty = true;
    }
    const promise = dirty ? renderComponent(rctx, ctx, flags) : void 0;
    return then(promise, () => {
      const currentComponent = ctx.$component$;
      const slotMaps = getSlots(currentComponent, elm);
      const splittedChidren = splitBy(ch, getSlotName);
      const promises = [];
      const slotRctx = copyRenderContext(rctx);
      slotRctx.$localStack$.push(ctx);
      Object.entries(slotMaps.slots).forEach(([key, slotEl]) => {
        if (slotEl && !splittedChidren[key]) {
          const oldCh = getChildren(slotEl, "root");
          if (oldCh.length > 0) {
            removeVnodes(slotRctx, oldCh, 0, oldCh.length - 1);
          }
        }
      });
      Object.entries(slotMaps.templates).forEach(([key, templateEl]) => {
        if (templateEl && !splittedChidren[key]) {
          removeNode(slotRctx, templateEl);
          slotMaps.templates[key] = void 0;
        }
      });
      Object.entries(splittedChidren).forEach(([key, ch2]) => {
        const slotElm = getSlotElement(slotRctx, slotMaps, elm, key);
        promises.push(smartUpdateChildren(slotRctx, slotElm, ch2, "root", flags));
      });
      return then(promiseAll(promises), () => {
        removeTemplates(slotRctx, slotMaps);
      });
    });
  }
  const setsInnerHTML = checkInnerHTML(props);
  if (setsInnerHTML) {
    if (qDev$1 && ch.length > 0) {
      logWarn("Node can not have children when innerHTML is set");
    }
    return;
  }
  if (!isSlot) {
    return smartUpdateChildren(rctx, elm, ch, "root", flags);
  }
};
const addVnodes = (ctx, parentElm, before, vnodes, startIdx, endIdx, flags) => {
  const promises = [];
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = vnodes[startIdx];
    assertDefined(ch, "render: node must be defined at index", startIdx, vnodes);
    promises.push(createElm(ctx, ch, flags));
  }
  return then(promiseAll(promises), (children) => {
    for (const child of children) {
      insertBefore(ctx, parentElm, child, before);
    }
  });
};
const removeVnodes = (ctx, nodes, startIdx, endIdx) => {
  for (; startIdx <= endIdx; ++startIdx) {
    const ch = nodes[startIdx];
    if (ch) {
      removeNode(ctx, ch);
    }
  }
};
const getSlotElement = (ctx, slotMaps, parentEl, slotName) => {
  const slotEl = slotMaps.slots[slotName];
  if (slotEl) {
    return slotEl;
  }
  const templateEl = slotMaps.templates[slotName];
  if (templateEl) {
    return templateEl;
  }
  const template = createTemplate(ctx, slotName);
  prepend(ctx, parentEl, template);
  slotMaps.templates[slotName] = template;
  return template;
};
const createTemplate = (ctx, slotName) => {
  const template = createElement(ctx, "q:template", false);
  directSetAttribute(template, QSlot, slotName);
  directSetAttribute(template, "hidden", "");
  directSetAttribute(template, "aria-hidden", "true");
  return template;
};
const removeTemplates = (ctx, slotMaps) => {
  Object.keys(slotMaps.templates).forEach((key) => {
    const template = slotMaps.templates[key];
    if (template && slotMaps.slots[key] !== void 0) {
      removeNode(ctx, template);
      slotMaps.templates[key] = void 0;
    }
  });
};
const resolveSlotProjection = (ctx, hostElm, before, after) => {
  Object.entries(before.slots).forEach(([key, slotEl]) => {
    if (slotEl && !after.slots[key]) {
      const template = createTemplate(ctx, key);
      const slotChildren = getChildren(slotEl, "root");
      for (const child of slotChildren) {
        directAppendChild(template, child);
      }
      directInsertBefore(hostElm, template, hostElm.firstChild);
      ctx.$operations$.push({
        $el$: template,
        $operation$: "slot-to-template",
        $args$: slotChildren,
        $fn$: () => {
        }
      });
    }
  });
  Object.entries(after.slots).forEach(([key, slotEl]) => {
    if (slotEl && !before.slots[key]) {
      const template = before.templates[key];
      if (template) {
        const children = getChildren(template, "root");
        children.forEach((child) => {
          directAppendChild(slotEl, child);
        });
        template.remove();
        ctx.$operations$.push({
          $el$: slotEl,
          $operation$: "template-to-slot",
          $args$: [template],
          $fn$: () => {
          }
        });
      }
    }
  });
};
const getSlotName = (node) => {
  var _a2, _b;
  return (_b = (_a2 = node.$props$) == null ? void 0 : _a2[QSlot]) != null ? _b : "";
};
const createElm = (rctx, vnode, flags) => {
  var _a2;
  rctx.$perf$.$visited$++;
  const tag = vnode.$type$;
  if (tag === "#text") {
    return vnode.$elm$ = createTextNode(rctx, vnode.$text$);
  }
  if (tag === HOST_TYPE) {
    throw qError(QError_hostCanOnlyBeAtRoot);
  }
  let isSvg = !!(flags & IS_SVG);
  if (!isSvg && tag === "svg") {
    flags |= IS_SVG;
    isSvg = true;
  }
  const isVirtual = tag === VIRTUAL_TYPE;
  let elm;
  let isHead = !!(flags & IS_HEAD$1);
  if (isVirtual) {
    elm = newVirtualElement(rctx.$doc$);
  } else if (tag === "head") {
    elm = rctx.$doc$.head;
    flags |= IS_HEAD$1;
    isHead = true;
  } else if (tag === "title") {
    elm = (_a2 = rctx.$doc$.querySelector("title")) != null ? _a2 : createElement(rctx, tag, isSvg);
  } else {
    elm = createElement(rctx, tag, isSvg);
    flags &= ~IS_HEAD$1;
  }
  vnode.$elm$ = elm;
  const props = vnode.$props$;
  const isComponent = isComponentNode(vnode);
  const isSlot = isVirtual && QSlotName in props;
  const hasRef = !isVirtual && "ref" in props;
  const ctx = getContext(elm);
  setKey(elm, vnode.$key$);
  if (isHead && !isVirtual) {
    directSetAttribute(elm, "q:head", "");
  }
  if (isSvg && tag === "foreignObject") {
    isSvg = false;
    flags &= ~IS_SVG;
  }
  const currentComponent = rctx.$currentComponent$;
  if (currentComponent) {
    if (!isVirtual) {
      const scopedIds = currentComponent.$ctx$.$scopeIds$;
      if (scopedIds) {
        scopedIds.forEach((styleId) => {
          elm.classList.add(styleId);
        });
      }
    }
    if (isSlot) {
      directSetAttribute(elm, QSlotRef, currentComponent.$ctx$.$id$);
      currentComponent.$slots$.push(vnode);
    }
  }
  if (isComponent) {
    updateComponentProperties$1(ctx, rctx, props);
  } else {
    updateProperties$1(ctx, rctx, props, isSvg);
  }
  if (isComponent || ctx.$listeners$ || hasRef) {
    setQId(rctx, ctx);
  }
  let wait;
  if (isComponent) {
    const renderQRL = props[OnRenderProp];
    assertQrl(renderQRL);
    ctx.$renderQrl$ = renderQRL;
    wait = renderComponent(rctx, ctx, flags);
  } else {
    const setsInnerHTML = checkInnerHTML(props);
    if (setsInnerHTML) {
      if (qDev$1 && vnode.$children$.length > 0) {
        logWarn("Node can not have children when innerHTML is set");
      }
      return elm;
    }
  }
  return then(wait, () => {
    const currentComponent2 = ctx.$component$;
    let children = vnode.$children$;
    if (children.length > 0) {
      if (children.length === 1 && children[0].$type$ === SKIP_RENDER_TYPE) {
        children = children[0].$children$;
      }
      const slotRctx = copyRenderContext(rctx);
      slotRctx.$localStack$.push(ctx);
      const slotMap = isComponent ? getSlots(currentComponent2, elm) : void 0;
      const promises = children.map((ch) => createElm(slotRctx, ch, flags));
      return then(promiseAll(promises), () => {
        let parent = elm;
        for (const node of children) {
          if (slotMap) {
            parent = getSlotElement(slotRctx, slotMap, elm, getSlotName(node));
          }
          directAppendChild(parent, node.$elm$);
        }
        return elm;
      });
    }
    return elm;
  });
};
const getSlots = (componentCtx, hostElm) => {
  var _a2, _b, _c, _d;
  const slots = {};
  const templates = {};
  const parent = hostElm.parentElement;
  if (parent) {
    const slotRef = directGetAttribute(hostElm, "q:id");
    const existingSlots = queryAllVirtualByAttribute(parent, "q:sref", slotRef);
    for (const elm of existingSlots) {
      slots[(_a2 = directGetAttribute(elm, QSlotName)) != null ? _a2 : ""] = elm;
    }
  }
  const newSlots = (_b = componentCtx == null ? void 0 : componentCtx.$slots$) != null ? _b : EMPTY_ARRAY;
  const t = Array.from(hostElm.childNodes).filter(isSlotTemplate);
  for (const vnode of newSlots) {
    slots[(_c = vnode.$props$[QSlotName]) != null ? _c : ""] = vnode.$elm$;
  }
  for (const elm of t) {
    templates[(_d = directGetAttribute(elm, QSlot)) != null ? _d : ""] = elm;
  }
  return { slots, templates };
};
const handleStyle = (ctx, elm, _, newValue) => {
  setAttribute(ctx, elm, "style", stringifyStyle(newValue));
  return true;
};
const handleClass = (ctx, elm, _, newValue, oldValue) => {
  if (!oldValue) {
    oldValue = elm.className;
  }
  setAttribute(ctx, elm, "class", stringifyClass(newValue, oldValue));
  return true;
};
const checkBeforeAssign = (ctx, elm, prop, newValue) => {
  if (prop in elm) {
    if (elm[prop] !== newValue) {
      setProperty$1(ctx, elm, prop, newValue);
    }
  }
  return true;
};
const dangerouslySetInnerHTML = "dangerouslySetInnerHTML";
const setInnerHTML = (ctx, elm, _, newValue) => {
  if (dangerouslySetInnerHTML in elm) {
    setProperty$1(ctx, elm, dangerouslySetInnerHTML, newValue);
  } else if ("innerHTML" in elm) {
    setProperty$1(ctx, elm, "innerHTML", newValue);
  }
  return true;
};
const noop = () => {
  return true;
};
const PROP_HANDLER_MAP = {
  style: handleStyle,
  class: handleClass,
  className: handleClass,
  value: checkBeforeAssign,
  checked: checkBeforeAssign,
  [dangerouslySetInnerHTML]: setInnerHTML,
  innerHTML: noop
};
const updateProperties$1 = (elCtx, rctx, expectProps, isSvg) => {
  var _a2, _b;
  const keys = Object.keys(expectProps);
  if (keys.length === 0) {
    return false;
  }
  let cache = elCtx.$cache$;
  const elm = elCtx.$element$;
  for (const key of keys) {
    if (key === "children") {
      continue;
    }
    const newValue = expectProps[key];
    if (key === "ref") {
      newValue.current = elm;
      continue;
    }
    const cacheKey = key;
    if (!cache) {
      cache = elCtx.$cache$ = /* @__PURE__ */ new Map();
    }
    const oldValue = cache.get(cacheKey);
    if (newValue === oldValue) {
      continue;
    }
    cache.set(cacheKey, newValue);
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      setAttribute(rctx, elm, key, newValue);
      continue;
    }
    if (isOnProp(key)) {
      setEvent(elCtx, key, newValue);
      continue;
    }
    const exception = PROP_HANDLER_MAP[key];
    if (exception) {
      if (exception(rctx, elm, key, newValue, oldValue)) {
        continue;
      }
    }
    if (!isSvg && key in elm) {
      setProperty$1(rctx, elm, key, newValue);
      continue;
    }
    setAttribute(rctx, elm, key, newValue);
  }
  const cmp = rctx.$currentComponent$;
  if (cmp && !cmp.$attachedListeners$) {
    cmp.$attachedListeners$ = true;
    (_a2 = cmp.$ctx$.$listeners$) == null ? void 0 : _a2.forEach((qrl, eventName) => {
      addQRLListener(elCtx, eventName, qrl);
    });
  }
  (_b = elCtx.$listeners$) == null ? void 0 : _b.forEach((value, key) => {
    setAttribute(rctx, elm, fromCamelToKebabCase(key), serializeQRLs(value, elCtx));
  });
  return false;
};
const updateComponentProperties$1 = (ctx, rctx, expectProps) => {
  const keys = Object.keys(expectProps);
  if (keys.length === 0) {
    return false;
  }
  const qwikProps = getPropsMutator(ctx, rctx.$containerState$);
  for (const key of keys) {
    if (SKIPS_PROPS.includes(key)) {
      continue;
    }
    qwikProps.set(key, expectProps[key]);
  }
  return ctx.$dirty$;
};
const setEvent = (ctx, prop, value) => {
  assertTrue(prop.endsWith("$"), "render: event property does not end with $", prop);
  addQRLListener(ctx, normalizeOnProp(prop.slice(0, -1)), value);
};
const setAttribute = (ctx, el, prop, value) => {
  const fn = () => {
    if (value == null || value === false) {
      el.removeAttribute(prop);
    } else {
      const str = value === true ? "" : String(value);
      directSetAttribute(el, prop, str);
    }
  };
  ctx.$operations$.push({
    $el$: el,
    $operation$: "set-attribute",
    $args$: [prop, value],
    $fn$: fn
  });
};
const setProperty$1 = (ctx, node, key, value) => {
  const fn = () => {
    try {
      node[key] = value;
    } catch (err) {
      logError(codeToText(QError_setProperty), { node, key, value }, err);
    }
  };
  ctx.$operations$.push({
    $el$: node,
    $operation$: "set-property",
    $args$: [key, value],
    $fn$: fn
  });
};
const createElement = (ctx, expectTag, isSvg) => {
  const el = isSvg ? ctx.$doc$.createElementNS(SVG_NS, expectTag) : ctx.$doc$.createElement(expectTag);
  el[CONTAINER] = ctx.$containerEl$;
  ctx.$operations$.push({
    $el$: el,
    $operation$: "create-element",
    $args$: [expectTag],
    $fn$: () => {
    }
  });
  return el;
};
const insertBefore = (ctx, parent, newChild, refChild) => {
  const fn = () => {
    directInsertBefore(parent, newChild, refChild ? refChild : null);
  };
  ctx.$operations$.push({
    $el$: parent,
    $operation$: "insert-before",
    $args$: [newChild, refChild],
    $fn$: fn
  });
  return newChild;
};
const appendHeadStyle = (ctx, hostElement, styleTask) => {
  const fn = () => {
    const containerEl = ctx.$containerEl$;
    const doc = ctx.$doc$;
    const isDoc = doc.documentElement === containerEl;
    const headEl = doc.head;
    const style2 = doc.createElement("style");
    if (isDoc && !headEl) {
      logWarn("document.head is undefined");
    }
    directSetAttribute(style2, QStyle, styleTask.styleId);
    style2.textContent = styleTask.content;
    if (isDoc && headEl) {
      directAppendChild(headEl, style2);
    } else {
      directInsertBefore(containerEl, style2, containerEl.firstChild);
    }
  };
  ctx.$containerState$.$styleIds$.add(styleTask.styleId);
  ctx.$postOperations$.push({
    $el$: hostElement,
    $operation$: "append-style",
    $args$: [styleTask],
    $fn$: fn
  });
};
const prepend = (ctx, parent, newChild) => {
  const fn = () => {
    directInsertBefore(parent, newChild, parent.firstChild);
  };
  ctx.$operations$.push({
    $el$: parent,
    $operation$: "prepend",
    $args$: [newChild],
    $fn$: fn
  });
};
const removeNode = (ctx, el) => {
  const fn = () => {
    const parent = el.parentElement;
    if (parent) {
      if (el.nodeType === 1 || el.nodeType === 111) {
        cleanupTree(el, ctx.$containerState$.$subsManager$);
      }
      directRemoveChild(parent, el);
    } else if (qDev$1) {
      logWarn("Trying to remove component already removed", el);
    }
  };
  ctx.$operations$.push({
    $el$: el,
    $operation$: "remove",
    $args$: [],
    $fn$: fn
  });
};
const cleanupTree = (parent, subsManager) => {
  if (parent.hasAttribute(QSlotName)) {
    return;
  }
  cleanupElement(parent, subsManager);
  const ch = getChildren(parent, "elements");
  for (const child of ch) {
    cleanupTree(child, subsManager);
  }
};
const cleanupElement = (el, subsManager) => {
  const ctx = tryGetContext(el);
  if (ctx) {
    cleanupContext(ctx, subsManager);
  }
};
const createTextNode = (ctx, text) => {
  return ctx.$doc$.createTextNode(text);
};
const executeContextWithSlots = (ctx) => {
  const before = ctx.$roots$.map((elm) => getSlots(null, elm));
  executeDOMRender(ctx);
  const after = ctx.$roots$.map((elm) => getSlots(null, elm));
  assertEqual(before.length, after.length, "render: number of q:slots changed during render context execution", before, after);
  for (let i = 0; i < before.length; i++) {
    resolveSlotProjection(ctx, ctx.$roots$[i], before[i], after[i]);
  }
};
const executeDOMRender = (ctx) => {
  for (const op of ctx.$operations$) {
    op.$fn$();
  }
};
const directAppendChild = (parent, child) => {
  if (isVirtualElement(child)) {
    child.appendTo(parent);
  } else {
    parent.appendChild(child);
  }
};
const directRemoveChild = (parent, child) => {
  if (isVirtualElement(child)) {
    child.remove();
  } else {
    parent.removeChild(child);
  }
};
const directInsertBefore = (parent, child, ref) => {
  if (isVirtualElement(child)) {
    child.insertBeforeTo(parent, getRootNode(ref));
  } else {
    parent.insertBefore(child, getRootNode(ref));
  }
};
const printRenderStats = (ctx) => {
  var _a2;
  if (qDev$1) {
    if (typeof window !== "undefined" && window.document != null) {
      const byOp = {};
      for (const op of ctx.$operations$) {
        byOp[op.$operation$] = ((_a2 = byOp[op.$operation$]) != null ? _a2 : 0) + 1;
      }
      const affectedElements = Array.from(new Set(ctx.$operations$.map((a) => a.$el$)));
      const stats = {
        byOp,
        roots: ctx.$roots$,
        hostElements: Array.from(ctx.$hostElements$),
        affectedElements,
        visitedNodes: ctx.$perf$.$visited$,
        operations: ctx.$operations$.map((v) => [v.$operation$, v.$el$, ...v.$args$])
      };
      const noOps = ctx.$operations$.length === 0;
      logDebug("Render stats.", noOps ? "No operations" : "", stats);
    }
  }
};
const createKeyToOldIdx = (children, beginIdx, endIdx) => {
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const child = children[i];
    if (child.nodeType === 1) {
      const key = getKey(child);
      if (key != null) {
        map[key] = i;
      }
    }
  }
  return map;
};
const KEY_SYMBOL = Symbol("vnode key");
const getKey = (el) => {
  let key = el[KEY_SYMBOL];
  if (key === void 0) {
    key = el[KEY_SYMBOL] = directGetAttribute(el, "q:key");
  }
  return key;
};
const setKey = (el, key) => {
  if (isString(key)) {
    directSetAttribute(el, "q:key", key);
  }
  el[KEY_SYMBOL] = key;
};
const sameVnode = (elm, vnode2) => {
  const isElement2 = elm.nodeType === 1 || elm.nodeType === 111;
  const type = vnode2.$type$;
  if (isElement2) {
    const isSameSel = elm.localName === type;
    if (!isSameSel) {
      return false;
    }
    return getKey(elm) === vnode2.$key$;
  }
  return elm.nodeName === type;
};
const isTagName = (elm, tagName) => {
  if (elm.nodeType === 1) {
    return elm.localName === tagName;
  }
  return elm.nodeName === tagName;
};
const checkInnerHTML = (props) => {
  return dangerouslySetInnerHTML in props;
};
const useLexicalScope = () => {
  var _a2;
  const context = getInvokeContext();
  const hostElement = context.$hostElement$;
  const qrl = (_a2 = context.$qrl$) != null ? _a2 : parseQRL(decodeURIComponent(String(context.$url$)), hostElement);
  assertQrl(qrl);
  if (qrl.$captureRef$ == null) {
    const el = context.$element$;
    assertDefined(el, "invoke: element must be defined inside useLexicalScope()", context);
    assertDefined(qrl.$capture$, "invoke: qrl capture must be defined inside useLexicalScope()", qrl);
    const container = getContainer(el);
    assertDefined(container, `invoke: cant find parent q:container of`, el);
    resumeIfNeeded(container);
    const ctx = getContext(el);
    qrl.$captureRef$ = qrl.$capture$.map((idx) => qInflate(idx, ctx));
  }
  const subscriber = context.$subscriber$;
  if (subscriber) {
    return qrl.$captureRef$;
  }
  return qrl.$captureRef$;
};
const qInflate = (ref, hostCtx) => {
  const int = parseInt(ref, 10);
  const obj = hostCtx.$refMap$[int];
  assertTrue(hostCtx.$refMap$.length > int, "out of bounds inflate access", ref);
  return obj;
};
const notifyChange = (subscriber, containerState) => {
  if (isQwikElement(subscriber)) {
    notifyRender(subscriber, containerState);
  } else {
    notifyWatch(subscriber, containerState);
  }
};
const notifyRender = (hostElement, containerState) => {
  const isServer2 = qDynamicPlatform && !qTest && containerState.$platform$.isServer;
  if (!isServer2) {
    resumeIfNeeded(containerState.$containerEl$);
  }
  const ctx = getContext(hostElement);
  assertDefined(ctx.$renderQrl$, `render: notified host element must have a defined $renderQrl$`, ctx);
  if (ctx.$dirty$) {
    return;
  }
  ctx.$dirty$ = true;
  const activeRendering = containerState.$hostsRendering$ !== void 0;
  if (activeRendering) {
    assertDefined(containerState.$renderPromise$, "render: while rendering, $renderPromise$ must be defined", containerState);
    containerState.$hostsStaging$.add(hostElement);
  } else {
    if (isServer2) {
      logWarn("Can not rerender in server platform");
      return void 0;
    }
    containerState.$hostsNext$.add(hostElement);
    scheduleFrame(containerState);
  }
};
const notifyWatch = (watch, containerState) => {
  if (watch.$flags$ & WatchFlagsIsDirty) {
    return;
  }
  watch.$flags$ |= WatchFlagsIsDirty;
  const activeRendering = containerState.$hostsRendering$ !== void 0;
  if (activeRendering) {
    assertDefined(containerState.$renderPromise$, "render: while rendering, $renderPromise$ must be defined", containerState);
    containerState.$watchStaging$.add(watch);
  } else {
    containerState.$watchNext$.add(watch);
    scheduleFrame(containerState);
  }
};
const scheduleFrame = (containerState) => {
  if (containerState.$renderPromise$ === void 0) {
    containerState.$renderPromise$ = containerState.$platform$.nextTick(() => renderMarked(containerState));
  }
  return containerState.$renderPromise$;
};
const _hW = () => {
  const [watch] = useLexicalScope();
  notifyWatch(watch, getContainerState(getContainer(watch.$el$)));
};
const renderMarked = async (containerState) => {
  const hostsRendering = containerState.$hostsRendering$ = new Set(containerState.$hostsNext$);
  containerState.$hostsNext$.clear();
  await executeWatchesBefore(containerState);
  containerState.$hostsStaging$.forEach((host) => {
    hostsRendering.add(host);
  });
  containerState.$hostsStaging$.clear();
  const doc = getDocument(containerState.$containerEl$);
  const platform = containerState.$platform$;
  const renderingQueue = Array.from(hostsRendering);
  sortNodes(renderingQueue);
  const ctx = createRenderContext(doc, containerState);
  for (const el of renderingQueue) {
    if (!ctx.$hostElements$.has(el)) {
      ctx.$roots$.push(el);
      try {
        await renderComponent(ctx, getContext(el), getFlags(el.parentElement));
      } catch (e) {
        logError(codeToText(QError_errorWhileRendering), e);
      }
    }
  }
  ctx.$operations$.push(...ctx.$postOperations$);
  if (ctx.$operations$.length === 0) {
    printRenderStats(ctx);
    postRendering(containerState, ctx);
    return ctx;
  }
  return platform.raf(() => {
    executeContextWithSlots(ctx);
    printRenderStats(ctx);
    postRendering(containerState, ctx);
    return ctx;
  });
};
const getFlags = (el) => {
  let flags = 0;
  if (el) {
    if (el.namespaceURI === SVG_NS) {
      flags |= IS_SVG;
    }
    if (el.tagName === "HEAD") {
      flags |= IS_HEAD$1;
    }
  }
  return flags;
};
const postRendering = async (containerState, ctx) => {
  await executeWatchesAfter(containerState, (watch, stage) => {
    if ((watch.$flags$ & WatchFlagsIsEffect) === 0) {
      return false;
    }
    if (stage) {
      return ctx.$hostElements$.has(watch.$el$);
    }
    return true;
  });
  containerState.$hostsStaging$.forEach((el) => {
    containerState.$hostsNext$.add(el);
  });
  containerState.$hostsStaging$.clear();
  containerState.$hostsRendering$ = void 0;
  containerState.$renderPromise$ = void 0;
  if (containerState.$hostsNext$.size + containerState.$watchNext$.size > 0) {
    scheduleFrame(containerState);
  }
};
const executeWatchesBefore = async (containerState) => {
  const resourcesPromises = [];
  const watchPromises = [];
  const isWatch = (watch) => (watch.$flags$ & WatchFlagsIsWatch) !== 0;
  const isResourceWatch2 = (watch) => (watch.$flags$ & WatchFlagsIsResource) !== 0;
  containerState.$watchNext$.forEach((watch) => {
    if (isWatch(watch)) {
      watchPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      containerState.$watchNext$.delete(watch);
    }
    if (isResourceWatch2(watch)) {
      resourcesPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      containerState.$watchNext$.delete(watch);
    }
  });
  do {
    containerState.$watchStaging$.forEach((watch) => {
      if (isWatch(watch)) {
        watchPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      } else if (isResourceWatch2(watch)) {
        resourcesPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      } else {
        containerState.$watchNext$.add(watch);
      }
    });
    containerState.$watchStaging$.clear();
    if (watchPromises.length > 0) {
      const watches = await Promise.all(watchPromises);
      sortWatches(watches);
      await Promise.all(watches.map((watch) => {
        return runSubscriber(watch, containerState);
      }));
      watchPromises.length = 0;
    }
  } while (containerState.$watchStaging$.size > 0);
  if (resourcesPromises.length > 0) {
    const resources = await Promise.all(resourcesPromises);
    sortWatches(resources);
    resources.forEach((watch) => runSubscriber(watch, containerState));
  }
};
const executeWatchesAfter = async (containerState, watchPred) => {
  const watchPromises = [];
  containerState.$watchNext$.forEach((watch) => {
    if (watchPred(watch, false)) {
      watchPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      containerState.$watchNext$.delete(watch);
    }
  });
  do {
    containerState.$watchStaging$.forEach((watch) => {
      if (watchPred(watch, true)) {
        watchPromises.push(then(watch.$qrl$.$resolveLazy$(watch.$el$), () => watch));
      } else {
        containerState.$watchNext$.add(watch);
      }
    });
    containerState.$watchStaging$.clear();
    if (watchPromises.length > 0) {
      const watches = await Promise.all(watchPromises);
      sortWatches(watches);
      await Promise.all(watches.map((watch) => {
        return runSubscriber(watch, containerState);
      }));
      watchPromises.length = 0;
    }
  } while (containerState.$watchStaging$.size > 0);
};
const sortNodes = (elements) => {
  elements.sort((a, b) => a.compareDocumentPosition(getRootNode(b)) & 2 ? 1 : -1);
};
const sortWatches = (watches) => {
  watches.sort((a, b) => {
    if (a.$el$ === b.$el$) {
      return a.$index$ < b.$index$ ? -1 : 1;
    }
    return (a.$el$.compareDocumentPosition(getRootNode(b.$el$)) & 2) !== 0 ? 1 : -1;
  });
};
const CONTAINER_STATE = Symbol("ContainerState");
const getContainerState = (containerEl) => {
  let set = containerEl[CONTAINER_STATE];
  if (!set) {
    containerEl[CONTAINER_STATE] = set = {
      $containerEl$: containerEl,
      $proxyMap$: /* @__PURE__ */ new WeakMap(),
      $subsManager$: null,
      $platform$: getPlatform(containerEl),
      $watchNext$: /* @__PURE__ */ new Set(),
      $watchStaging$: /* @__PURE__ */ new Set(),
      $hostsNext$: /* @__PURE__ */ new Set(),
      $hostsStaging$: /* @__PURE__ */ new Set(),
      $renderPromise$: void 0,
      $hostsRendering$: void 0,
      $envData$: {},
      $elementIndex$: 0,
      $styleIds$: /* @__PURE__ */ new Set(),
      $mutableProps$: false
    };
    set.$subsManager$ = createSubscriptionManager(set);
  }
  return set;
};
const createSubscriptionManager = (containerState) => {
  const objToSubs = /* @__PURE__ */ new Map();
  const subsToObjs = /* @__PURE__ */ new Map();
  const clearSub = (sub) => {
    const subs = subsToObjs.get(sub);
    if (subs) {
      subs.forEach((s) => {
        s.delete(sub);
      });
      subsToObjs.delete(sub);
      subs.clear();
    }
  };
  const tryGetLocal = (obj) => {
    assertEqual(getProxyTarget(obj), void 0, "object can not be be a proxy", obj);
    return objToSubs.get(obj);
  };
  const trackSubToObj = (subscriber, map) => {
    let set = subsToObjs.get(subscriber);
    if (!set) {
      subsToObjs.set(subscriber, set = /* @__PURE__ */ new Set());
    }
    set.add(map);
  };
  const getLocal = (obj, initialMap) => {
    let local = tryGetLocal(obj);
    if (local) {
      assertEqual(initialMap, void 0, "subscription map can not be set to an existing object", local);
    } else {
      const map = !initialMap ? /* @__PURE__ */ new Map() : initialMap;
      map.forEach((_, key) => {
        trackSubToObj(key, map);
      });
      objToSubs.set(obj, local = {
        $subs$: map,
        $addSub$(subscriber, key) {
          if (key == null) {
            map.set(subscriber, null);
          } else {
            let sub = map.get(subscriber);
            if (sub === void 0) {
              map.set(subscriber, sub = /* @__PURE__ */ new Set());
            }
            if (sub) {
              sub.add(key);
            }
          }
          trackSubToObj(subscriber, map);
        },
        $notifySubs$(key) {
          map.forEach((value, subscriber) => {
            if (value === null || !key || value.has(key)) {
              notifyChange(subscriber, containerState);
            }
          });
        }
      });
    }
    return local;
  };
  return {
    $tryGetLocal$: tryGetLocal,
    $getLocal$: getLocal,
    $clearSub$: clearSub
  };
};
const pauseContainer = async (elmOrDoc, defaultParentJSON) => {
  const doc = getDocument(elmOrDoc);
  const documentElement = doc.documentElement;
  const containerEl = isDocument(elmOrDoc) ? documentElement : elmOrDoc;
  if (directGetAttribute(containerEl, QContainerAttr) === "paused") {
    throw qError(QError_containerAlreadyPaused);
  }
  const parentJSON = defaultParentJSON != null ? defaultParentJSON : containerEl === doc.documentElement ? doc.body : containerEl;
  const data = await pauseFromContainer(containerEl);
  const script = doc.createElement("script");
  directSetAttribute(script, "type", "qwik/json");
  script.textContent = escapeText$1(JSON.stringify(data.state, void 0, qDev$1 ? "  " : void 0));
  parentJSON.appendChild(script);
  directSetAttribute(containerEl, QContainerAttr, "paused");
  return data;
};
const moveStyles = (containerEl, containerState) => {
  const head = containerEl.ownerDocument.head;
  containerEl.querySelectorAll("style[q\\:style]").forEach((el) => {
    containerState.$styleIds$.add(el.getAttribute(QStyle));
    head.appendChild(el);
  });
};
const resumeContainer = (containerEl) => {
  if (!isContainer(containerEl)) {
    logWarn("Skipping hydration because parent element is not q:container");
    return;
  }
  const doc = getDocument(containerEl);
  const isDocElement = containerEl === doc.documentElement;
  const parentJSON = isDocElement ? doc.body : containerEl;
  const script = getQwikJSON(parentJSON);
  if (!script) {
    logWarn("Skipping hydration qwik/json metadata was not found.");
    return;
  }
  script.remove();
  const containerState = getContainerState(containerEl);
  moveStyles(containerEl, containerState);
  const meta = JSON.parse(unescapeText(script.textContent || "{}"));
  const elements = /* @__PURE__ */ new Map();
  const getObject = (id) => {
    return getObjectImpl(id, elements, meta.objs, containerState);
  };
  let maxId = 0;
  getNodesInScope(containerEl, hasQId).forEach((el) => {
    const id = directGetAttribute(el, ELEMENT_ID);
    assertDefined(id, `resume: element missed q:id`, el);
    const ctx = getContext(el);
    ctx.$id$ = id;
    ctx.$mounted$ = true;
    elements.set(ELEMENT_ID_PREFIX + id, el);
    maxId = Math.max(maxId, strToInt(id));
  });
  containerState.$elementIndex$ = ++maxId;
  const parser = createParser(getObject, containerState, doc);
  reviveValues(meta.objs, meta.subs, getObject, containerState, parser);
  for (const obj of meta.objs) {
    reviveNestedObjects(obj, getObject, parser);
  }
  Object.entries(meta.ctx).forEach(([elementID, ctxMeta]) => {
    const el = getObject(elementID);
    assertDefined(el, `resume: cant find dom node for id`, elementID);
    const ctx = getContext(el);
    const qobj = ctxMeta.r;
    const seq = ctxMeta.s;
    const host = ctxMeta.h;
    const contexts = ctxMeta.c;
    const watches = ctxMeta.w;
    if (qobj) {
      assertTrue(isElement$1(el), "el must be an actual DOM element");
      ctx.$refMap$.push(...qobj.split(" ").map((part) => getObject(part)));
      ctx.$listeners$ = getDomListeners(el);
    }
    if (seq) {
      ctx.$seq$ = seq.split(" ").map((part) => getObject(part));
    }
    if (watches) {
      ctx.$watches$ = watches.split(" ").map((part) => getObject(part));
    }
    if (contexts) {
      contexts.split(" ").map((part) => {
        const [key, value] = part.split("=");
        if (!ctx.$contexts$) {
          ctx.$contexts$ = /* @__PURE__ */ new Map();
        }
        ctx.$contexts$.set(key, getObject(value));
      });
    }
    if (host) {
      const [props, renderQrl] = host.split(" ");
      assertDefined(props, `resume: props missing in host metadata`, host);
      assertDefined(renderQrl, `resume: renderQRL missing in host metadata`, host);
      ctx.$props$ = getObject(props);
      ctx.$renderQrl$ = getObject(renderQrl);
    }
  });
  directSetAttribute(containerEl, QContainerAttr, "resumed");
  logDebug("Container resumed");
  emitEvent(containerEl, "qresume", void 0, true);
};
const pauseFromContainer = async (containerEl) => {
  const containerState = getContainerState(containerEl);
  const contexts = getNodesInScope(containerEl, hasQId).map(tryGetContext);
  return _pauseFromContexts(contexts, containerState);
};
const _pauseFromContexts = async (elements, containerState) => {
  const elementToIndex = /* @__PURE__ */ new Map();
  const collector = createCollector(containerState);
  const listeners = [];
  for (const ctx of elements) {
    const el = ctx.$element$;
    if (ctx.$listeners$ && isElement$1(el)) {
      ctx.$listeners$.forEach((qrls, key) => {
        qrls.forEach((qrl) => {
          listeners.push({
            key,
            qrl,
            el
          });
        });
      });
    }
    for (const watch of ctx.$watches$) {
      collector.$watches$.push(watch);
    }
  }
  if (listeners.length === 0) {
    return {
      state: {
        ctx: {},
        objs: [],
        subs: []
      },
      objs: [],
      listeners: [],
      pendingContent: [],
      mode: "static"
    };
  }
  for (const listener of listeners) {
    assertQrl(listener.qrl);
    const captured = listener.qrl.$captureRef$;
    if (captured) {
      for (const obj of captured) {
        await collectValue(obj, collector, true);
      }
    }
    const ctx = tryGetContext(listener.el);
    for (const obj of ctx.$refMap$) {
      await collectValue(obj, collector, true);
    }
  }
  const canRender = collector.$elements$.length > 0;
  if (canRender) {
    for (const ctx of elements) {
      await collectProps(ctx.$element$, ctx.$props$, collector);
      if (ctx.$contexts$) {
        for (const item of ctx.$contexts$.values()) {
          await collectValue(item, collector, false);
        }
      }
    }
  }
  const objs = Array.from(new Set(collector.$objMap$.values()));
  const objToId = /* @__PURE__ */ new Map();
  const getElementID = (el) => {
    let id = elementToIndex.get(el);
    if (id === void 0) {
      if (el.isConnected) {
        id = getQId(el);
        if (!id) {
          console.warn("Missing ID", el);
        } else {
          id = ELEMENT_ID_PREFIX + id;
        }
      } else {
        id = null;
      }
      elementToIndex.set(el, id);
    }
    return id;
  };
  const getObjId = (obj) => {
    let suffix = "";
    if (isMutable(obj)) {
      obj = obj.v;
      suffix = "%";
    }
    if (isPromise(obj)) {
      const { value, resolved } = getPromiseValue(obj);
      obj = value;
      if (resolved) {
        suffix += "~";
      } else {
        suffix += "_";
      }
    }
    if (isObject(obj)) {
      const target = getProxyTarget(obj);
      if (target) {
        suffix += "!";
        obj = target;
      }
      if (!target && isQwikElement(obj)) {
        const elID = getElementID(obj);
        if (elID) {
          return elID + suffix;
        }
        return null;
      }
    }
    if (collector.$objMap$.has(obj)) {
      const value = collector.$objMap$.get(obj);
      const id = objToId.get(value);
      assertTrue(typeof id === "number", "Can not find ID for object");
      return intToStr(id) + suffix;
    }
    return null;
  };
  const mustGetObjId = (obj) => {
    const key = getObjId(obj);
    if (key === null) {
      throw qError(QError_missingObjectId, obj);
    }
    return key;
  };
  const subsMap = /* @__PURE__ */ new Map();
  objs.forEach((obj) => {
    var _a2;
    const flags = getProxyFlags(containerState.$proxyMap$.get(obj));
    if (flags === void 0) {
      return;
    }
    const subsObj = [];
    if (flags > 0) {
      subsObj.push({
        subscriber: "$",
        data: flags
      });
    }
    const subs2 = (_a2 = containerState.$subsManager$.$tryGetLocal$(obj)) == null ? void 0 : _a2.$subs$;
    if (subs2) {
      subs2.forEach((set, key) => {
        if (isQwikElement(key)) {
          if (!collector.$elements$.includes(key)) {
            return;
          }
        }
        subsObj.push({
          subscriber: key,
          data: set ? Array.from(set) : null
        });
      });
    }
    if (subsObj.length > 0) {
      subsMap.set(obj, subsObj);
    }
  });
  objs.sort((a, b) => {
    const isProxyA = subsMap.has(a) ? 0 : 1;
    const isProxyB = subsMap.has(b) ? 0 : 1;
    return isProxyA - isProxyB;
  });
  let count = 0;
  for (const obj of objs) {
    objToId.set(obj, count);
    count++;
  }
  const subs = objs.map((obj) => {
    const sub = subsMap.get(obj);
    if (!sub) {
      return null;
    }
    const subsObj = {};
    sub.forEach(({ subscriber, data }) => {
      if (subscriber === "$") {
        subsObj[subscriber] = data;
      } else {
        const id = getObjId(subscriber);
        if (id !== null) {
          subsObj[id] = data;
        }
      }
    });
    return subsObj;
  }).filter(isNotNullable);
  const convertedObjs = objs.map((obj) => {
    if (obj === null) {
      return null;
    }
    const typeObj = typeof obj;
    switch (typeObj) {
      case "undefined":
        return UNDEFINED_PREFIX;
      case "string":
      case "number":
      case "boolean":
        return obj;
      default:
        const value = serializeValue(obj, getObjId, containerState);
        if (value !== void 0) {
          return value;
        }
        if (typeObj === "object") {
          if (isArray(obj)) {
            return obj.map(mustGetObjId);
          }
          if (isSerializableObject(obj)) {
            const output = {};
            Object.entries(obj).forEach(([key, value2]) => {
              output[key] = mustGetObjId(value2);
            });
            return output;
          }
        }
        break;
    }
    throw qError(QError_verifySerializable, obj);
  });
  const meta = {};
  elements.forEach((ctx) => {
    const node = ctx.$element$;
    assertDefined(ctx, `pause: missing context for dom node`, node);
    const ref = ctx.$refMap$;
    const props = ctx.$props$;
    const contexts = ctx.$contexts$;
    const watches = ctx.$watches$;
    const renderQrl = ctx.$renderQrl$;
    const seq = ctx.$seq$;
    const metaValue = {};
    const elementCaptured = collector.$elements$.includes(node);
    let add = false;
    if (ref.length > 0) {
      const value = ref.map(mustGetObjId).join(" ");
      if (value) {
        metaValue.r = value;
        add = true;
      }
    }
    if (canRender) {
      if (elementCaptured && props) {
        const objs2 = [props];
        if (renderQrl) {
          objs2.push(renderQrl);
        }
        const value = objs2.map(mustGetObjId).join(" ");
        if (value) {
          metaValue.h = value;
          add = true;
        }
      }
      if (watches.length > 0) {
        const value = watches.map(getObjId).filter(isNotNullable).join(" ");
        if (value) {
          metaValue.w = value;
          add = true;
        }
      }
      if (elementCaptured && seq.length > 0) {
        const value = seq.map(mustGetObjId).join(" ");
        if (value) {
          metaValue.s = value;
          add = true;
        }
      }
      if (contexts) {
        const serializedContexts = [];
        contexts.forEach((value2, key) => {
          serializedContexts.push(`${key}=${mustGetObjId(value2)}`);
        });
        const value = serializedContexts.join(" ");
        if (value) {
          metaValue.c = value;
          add = true;
        }
      }
    }
    if (add) {
      const elementID = getElementID(node);
      assertDefined(elementID, `pause: can not generate ID for dom node`, node);
      meta[elementID] = metaValue;
    }
  });
  const pendingContent = [];
  for (const watch of collector.$watches$) {
    if (qDev$1) {
      if (watch.$flags$ & WatchFlagsIsDirty) {
        logWarn("Serializing dirty watch. Looks like an internal error.");
      }
      if (!isConnected(watch)) {
        logWarn("Serializing disconneted watch. Looks like an internal error.");
      }
    }
    destroyWatch(watch);
  }
  if (qDev$1) {
    elementToIndex.forEach((value, el) => {
      if (!value) {
        logWarn("unconnected element", el.nodeName, "\n");
      }
    });
  }
  return {
    state: {
      ctx: meta,
      objs: convertedObjs,
      subs
    },
    pendingContent,
    objs,
    listeners,
    mode: canRender ? "render" : "listeners"
  };
};
const getQwikJSON = (parentElm) => {
  let child = parentElm.lastElementChild;
  while (child) {
    if (child.tagName === "SCRIPT" && directGetAttribute(child, "type") === "qwik/json") {
      return child;
    }
    child = child.previousElementSibling;
  }
  return void 0;
};
const SHOW_ELEMENT = 1;
const SHOW_COMMENT = 128;
const FILTER_ACCEPT = 1;
const FILTER_REJECT = 2;
const FILTER_SKIP = 3;
const getNodesInScope = (parent, predicate) => {
  if (predicate(parent))
    ;
  const walker = parent.ownerDocument.createTreeWalker(parent, SHOW_ELEMENT | SHOW_COMMENT, {
    acceptNode(node) {
      if (isContainer(node)) {
        return FILTER_REJECT;
      }
      return predicate(node) ? FILTER_ACCEPT : FILTER_SKIP;
    }
  });
  const pars = [];
  let currentNode = null;
  while (currentNode = walker.nextNode()) {
    pars.push(processVirtualNodes(currentNode));
  }
  return pars;
};
const reviveValues = (objs, subs, getObject, containerState, parser) => {
  for (let i = 0; i < objs.length; i++) {
    const value = objs[i];
    if (isString(value)) {
      objs[i] = value === UNDEFINED_PREFIX ? void 0 : parser.prepare(value);
    }
  }
  for (let i = 0; i < subs.length; i++) {
    const value = objs[i];
    const sub = subs[i];
    if (sub) {
      const converted = /* @__PURE__ */ new Map();
      let flags = 0;
      Object.entries(sub).forEach((entry) => {
        if (entry[0] === "$") {
          flags = entry[1];
          return;
        }
        const el = getObject(entry[0]);
        if (!el) {
          logWarn("QWIK can not revive subscriptions because of missing element ID", entry, value);
          return;
        }
        const set = entry[1] === null ? null : new Set(entry[1]);
        converted.set(el, set);
      });
      createProxy(value, containerState, flags, converted);
    }
  }
};
const reviveNestedObjects = (obj, getObject, parser) => {
  if (parser.fill(obj)) {
    return;
  }
  if (obj && typeof obj == "object") {
    if (isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const value = obj[i];
        if (typeof value == "string") {
          obj[i] = getObject(value);
        } else {
          reviveNestedObjects(value, getObject, parser);
        }
      }
    } else if (isSerializableObject(obj)) {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (typeof value == "string") {
            obj[key] = getObject(value);
          } else {
            reviveNestedObjects(value, getObject, parser);
          }
        }
      }
    }
  }
};
const OBJECT_TRANSFORMS = {
  "!": (obj, containerState) => {
    var _a2;
    return (_a2 = containerState.$proxyMap$.get(obj)) != null ? _a2 : getOrCreateProxy(obj, containerState);
  },
  "%": (obj) => {
    return mutable(obj);
  },
  "~": (obj) => {
    return Promise.resolve(obj);
  },
  _: (obj) => {
    return Promise.reject(obj);
  }
};
const getObjectImpl = (id, elements, objs, containerState) => {
  assertTrue(typeof id === "string" && id.length > 0, "resume: id must be an non-empty string, got:", id);
  if (id.startsWith(ELEMENT_ID_PREFIX)) {
    assertTrue(elements.has(id), `missing element for id:`, id);
    return elements.get(id);
  }
  const index2 = strToInt(id);
  assertTrue(objs.length > index2, "resume: index is out of bounds", id);
  let obj = objs[index2];
  for (let i = id.length - 1; i >= 0; i--) {
    const code = id[i];
    const transform = OBJECT_TRANSFORMS[code];
    if (!transform) {
      break;
    }
    obj = transform(obj, containerState);
  }
  return obj;
};
const collectProps = async (el, props, collector) => {
  var _a2;
  const subs = (_a2 = collector.$containerState$.$subsManager$.$tryGetLocal$(getProxyTarget(props))) == null ? void 0 : _a2.$subs$;
  if (subs && subs.has(el)) {
    await collectElement(el, collector);
  }
};
const createCollector = (containerState) => {
  return {
    $seen$: /* @__PURE__ */ new Set(),
    $seenLeaks$: /* @__PURE__ */ new Set(),
    $objMap$: /* @__PURE__ */ new Map(),
    $elements$: [],
    $watches$: [],
    $containerState$: containerState
  };
};
const collectElement = async (el, collector) => {
  if (collector.$elements$.includes(el)) {
    return;
  }
  const ctx = tryGetContext(el);
  if (ctx) {
    collector.$elements$.push(el);
    if (ctx.$props$) {
      await collectValue(ctx.$props$, collector, false);
    }
    if (ctx.$renderQrl$) {
      await collectValue(ctx.$renderQrl$, collector, false);
    }
    for (const obj of ctx.$seq$) {
      await collectValue(obj, collector, false);
    }
    for (const obj of ctx.$watches$) {
      await collectValue(obj, collector, false);
    }
    if (ctx.$contexts$) {
      for (const obj of ctx.$contexts$.values()) {
        await collectValue(obj, collector, false);
      }
    }
  }
};
const escapeText$1 = (str) => {
  return str.replace(/<(\/?script)/g, "\\x3C$1");
};
const unescapeText = (str) => {
  return str.replace(/\\x3C(\/?script)/g, "<$1");
};
const collectSubscriptions = async (target, collector) => {
  var _a2;
  const subs = (_a2 = collector.$containerState$.$subsManager$.$tryGetLocal$(target)) == null ? void 0 : _a2.$subs$;
  if (subs) {
    if (collector.$seen$.has(subs)) {
      return;
    }
    collector.$seen$.add(subs);
    for (const key of Array.from(subs.keys())) {
      if (isVirtualElement(key)) {
        await collectElement(key, collector);
      } else {
        await collectValue(key, collector, true);
      }
    }
  }
};
const PROMISE_VALUE = Symbol();
const resolvePromise = (promise) => {
  return promise.then((value) => {
    const v = {
      resolved: true,
      value
    };
    promise[PROMISE_VALUE] = v;
    return value;
  }, (value) => {
    const v = {
      resolved: false,
      value
    };
    promise[PROMISE_VALUE] = v;
    return value;
  });
};
const getPromiseValue = (promise) => {
  assertTrue(PROMISE_VALUE in promise, "pause: promise was not resolved previously", promise);
  return promise[PROMISE_VALUE];
};
const collectValue = async (obj, collector, leaks) => {
  const input = obj;
  const seen = leaks ? collector.$seenLeaks$ : collector.$seen$;
  if (seen.has(obj)) {
    return;
  }
  seen.add(obj);
  if (!shouldSerialize(obj) || obj === void 0) {
    collector.$objMap$.set(obj, void 0);
    return;
  }
  if (obj != null) {
    if (isQrl$1(obj)) {
      collector.$objMap$.set(obj, obj);
      if (obj.$captureRef$) {
        for (const item of obj.$captureRef$) {
          await collectValue(item, collector, leaks);
        }
      }
      return;
    }
    if (typeof obj === "object") {
      if (isPromise(obj)) {
        const value = await resolvePromise(obj);
        await collectValue(value, collector, leaks);
        return;
      }
      const target = getProxyTarget(obj);
      if (!target && isNode$1(obj)) {
        if (isDocument(obj)) {
          collector.$objMap$.set(obj, obj);
        } else if (!isQwikElement(obj)) {
          throw qError(QError_verifySerializable, obj);
        }
        return;
      }
      if (target) {
        if (leaks) {
          await collectSubscriptions(target, collector);
        }
        obj = target;
        if (seen.has(obj)) {
          return;
        }
        seen.add(obj);
        if (isResourceReturn(obj)) {
          collector.$objMap$.set(target, target);
          await collectValue(obj.promise, collector, leaks);
          await collectValue(obj.resolved, collector, leaks);
          return;
        }
      }
      collector.$objMap$.set(obj, obj);
      if (isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          await collectValue(input[i], collector, leaks);
        }
      } else {
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            await collectValue(input[key], collector, leaks);
          }
        }
      }
      return;
    }
  }
  collector.$objMap$.set(obj, obj);
};
const isContainer = (el) => {
  return isElement$1(el) && el.hasAttribute(QContainerAttr);
};
const hasQId = (el) => {
  const node = processVirtualNodes(el);
  if (isQwikElement(node)) {
    return node.hasAttribute(ELEMENT_ID);
  }
  return false;
};
const intToStr = (nu) => {
  return nu.toString(36);
};
const strToInt = (nu) => {
  return parseInt(nu, 36);
};
const WatchFlagsIsEffect = 1 << 0;
const WatchFlagsIsWatch = 1 << 1;
const WatchFlagsIsDirty = 1 << 2;
const WatchFlagsIsCleanup = 1 << 3;
const WatchFlagsIsResource = 1 << 4;
const useWatchQrl = (qrl, opts) => {
  const { get, set, ctx, i } = useSequentialScope();
  if (get) {
    return;
  }
  assertQrl(qrl);
  const el = ctx.$hostElement$;
  const containerState = ctx.$renderCtx$.$containerState$;
  const watch = new Watch(WatchFlagsIsDirty | WatchFlagsIsWatch, i, el, qrl, void 0);
  set(true);
  qrl.$resolveLazy$(el);
  getContext(el).$watches$.push(watch);
  waitAndRun(ctx, () => runSubscriber(watch, containerState));
  if (isServer(ctx)) {
    useRunWatch(watch, opts == null ? void 0 : opts.eagerness);
  }
};
const isResourceWatch = (watch) => {
  return !!watch.$resource$;
};
const runSubscriber = async (watch, containerState) => {
  assertEqual(!!(watch.$flags$ & WatchFlagsIsDirty), true, "Resource is not dirty", watch);
  if (isResourceWatch(watch)) {
    await runResource(watch, containerState);
  } else {
    await runWatch(watch, containerState);
  }
};
const runResource = (watch, containerState, waitOn) => {
  watch.$flags$ &= ~WatchFlagsIsDirty;
  cleanupWatch(watch);
  const el = watch.$el$;
  const doc = getDocument(el);
  const invokationContext = newInvokeContext(doc, el, void 0, "WatchEvent");
  const { $subsManager$: subsManager } = containerState;
  const watchFn = watch.$qrl$.$invokeFn$(el, invokationContext, () => {
    subsManager.$clearSub$(watch);
  });
  const cleanups = [];
  const resource = watch.$resource$;
  assertDefined(resource, 'useResource: when running a resource, "watch.r" must be a defined.', watch);
  const track = (obj, prop) => {
    const target = getProxyTarget(obj);
    if (target) {
      const manager = subsManager.$getLocal$(target);
      manager.$addSub$(watch, prop);
    } else {
      logErrorAndStop(codeToText(QError_trackUseStore), obj);
    }
    if (prop) {
      return obj[prop];
    } else {
      return obj;
    }
  };
  const resourceTarget = unwrapProxy(resource);
  const opts = {
    track,
    cleanup(callback) {
      cleanups.push(callback);
    },
    previous: resourceTarget.resolved
  };
  let resolve;
  let reject;
  let done = false;
  const setState = (resolved, value) => {
    if (!done) {
      done = true;
      if (resolved) {
        done = true;
        resource.state = "resolved";
        resource.resolved = value;
        resource.error = void 0;
        resolve(value);
      } else {
        done = true;
        resource.state = "rejected";
        resource.resolved = void 0;
        resource.error = value;
        reject(value);
      }
      return true;
    }
    return false;
  };
  invoke(invokationContext, () => {
    resource.state = "pending";
    resource.resolved = void 0;
    resource.promise = new Promise((r, re) => {
      resolve = r;
      reject = re;
    });
  });
  watch.$destroy$ = noSerialize(() => {
    cleanups.forEach((fn) => fn());
  });
  const promise = safeCall(() => then(waitOn, () => watchFn(opts)), (value) => {
    setState(true, value);
  }, (reason) => {
    setState(false, reason);
  });
  const timeout = resourceTarget.timeout;
  if (timeout) {
    return Promise.race([
      promise,
      delay(timeout).then(() => {
        if (setState(false, "timeout")) {
          cleanupWatch(watch);
        }
      })
    ]);
  }
  return promise;
};
const runWatch = (watch, containerState) => {
  watch.$flags$ &= ~WatchFlagsIsDirty;
  cleanupWatch(watch);
  const el = watch.$el$;
  const doc = getDocument(el);
  const invokationContext = newInvokeContext(doc, el, void 0, "WatchEvent");
  const { $subsManager$: subsManager } = containerState;
  const watchFn = watch.$qrl$.$invokeFn$(el, invokationContext, () => {
    subsManager.$clearSub$(watch);
  });
  const track = (obj, prop) => {
    const target = getProxyTarget(obj);
    if (target) {
      const manager = subsManager.$getLocal$(target);
      manager.$addSub$(watch, prop);
    } else {
      logErrorAndStop(codeToText(QError_trackUseStore), obj);
    }
    if (prop) {
      return obj[prop];
    } else {
      return obj;
    }
  };
  const cleanups = [];
  watch.$destroy$ = noSerialize(() => {
    cleanups.forEach((fn) => fn());
  });
  const opts = {
    track,
    cleanup(callback) {
      cleanups.push(callback);
    }
  };
  return safeCall(() => watchFn(opts), (returnValue) => {
    if (isFunction(returnValue)) {
      cleanups.push(returnValue);
    }
  }, (reason) => {
    logError(reason);
  });
};
const cleanupWatch = (watch) => {
  const destroy = watch.$destroy$;
  if (destroy) {
    watch.$destroy$ = void 0;
    try {
      destroy();
    } catch (err) {
      logError(err);
    }
  }
};
const destroyWatch = (watch) => {
  if (watch.$flags$ & WatchFlagsIsCleanup) {
    watch.$flags$ &= ~WatchFlagsIsCleanup;
    const cleanup = watch.$qrl$.$invokeFn$(watch.$el$);
    cleanup();
  } else {
    cleanupWatch(watch);
  }
};
const useRunWatch = (watch, eagerness) => {
  if (eagerness === "load") {
    useOn("qinit", getWatchHandlerQrl(watch));
  } else if (eagerness === "visible") {
    useOn("qvisible", getWatchHandlerQrl(watch));
  }
};
const getWatchHandlerQrl = (watch) => {
  const watchQrl = watch.$qrl$;
  const watchHandler = createQRL(watchQrl.$chunk$, "_hW", _hW, null, null, [watch], watchQrl.$symbol$);
  return watchHandler;
};
const isSubscriberDescriptor = (obj) => {
  return isObject(obj) && obj instanceof Watch;
};
const serializeWatch = (watch, getObjId) => {
  let value = `${intToStr(watch.$flags$)} ${intToStr(watch.$index$)} ${getObjId(watch.$qrl$)} ${getObjId(watch.$el$)}`;
  if (isResourceWatch(watch)) {
    value += ` ${getObjId(watch.$resource$)}`;
  }
  return value;
};
const parseWatch = (data) => {
  const [flags, index2, qrl, el, resource] = data.split(" ");
  return new Watch(strToInt(flags), strToInt(index2), el, qrl, resource);
};
class Watch {
  constructor($flags$, $index$, $el$, $qrl$, $resource$) {
    this.$flags$ = $flags$;
    this.$index$ = $index$;
    this.$el$ = $el$;
    this.$qrl$ = $qrl$;
    this.$resource$ = $resource$;
  }
}
const _createResourceReturn = (opts) => {
  const resource = {
    __brand: "resource",
    promise: void 0,
    resolved: void 0,
    error: void 0,
    state: "pending",
    timeout: opts == null ? void 0 : opts.timeout
  };
  return resource;
};
const isResourceReturn = (obj) => {
  return isObject(obj) && obj.__brand === "resource";
};
const serializeResource = (resource, getObjId) => {
  const state = resource.state;
  if (state === "resolved") {
    return `0 ${getObjId(resource.resolved)}`;
  } else if (state === "pending") {
    return `1`;
  } else {
    return `2 ${getObjId(resource.error)}`;
  }
};
const parseResourceReturn = (data) => {
  const [first, id] = data.split(" ");
  const result = _createResourceReturn(void 0);
  result.promise = Promise.resolve();
  if (first === "0") {
    result.state = "resolved";
    result.resolved = id;
  } else if (first === "1") {
    result.state = "pending";
    result.promise = new Promise(() => {
    });
  } else if (first === "2") {
    result.state = "rejected";
    result.error = id;
  }
  return result;
};
const UNDEFINED_PREFIX = "";
const QRLSerializer = {
  prefix: "",
  test: (v) => isQrl$1(v),
  serialize: (obj, getObjId, containerState) => {
    return stringifyQRL(obj, {
      $platform$: containerState.$platform$,
      $getObjId$: getObjId
    });
  },
  prepare: (data, containerState) => {
    return parseQRL(data, containerState.$containerEl$);
  },
  fill: (qrl, getObject) => {
    if (qrl.$capture$ && qrl.$capture$.length > 0) {
      qrl.$captureRef$ = qrl.$capture$.map(getObject);
      qrl.$capture$ = null;
    }
  }
};
const WatchSerializer = {
  prefix: "",
  test: (v) => isSubscriberDescriptor(v),
  serialize: (obj, getObjId) => serializeWatch(obj, getObjId),
  prepare: (data) => parseWatch(data),
  fill: (watch, getObject) => {
    watch.$el$ = getObject(watch.$el$);
    watch.$qrl$ = getObject(watch.$qrl$);
    if (watch.$resource$) {
      watch.$resource$ = getObject(watch.$resource$);
    }
  }
};
const ResourceSerializer = {
  prefix: "",
  test: (v) => isResourceReturn(v),
  serialize: (obj, getObjId) => {
    return serializeResource(obj, getObjId);
  },
  prepare: (data) => {
    return parseResourceReturn(data);
  },
  fill: (resource, getObject) => {
    if (resource.state === "resolved") {
      resource.resolved = getObject(resource.resolved);
      resource.promise = Promise.resolve(resource.resolved);
    } else if (resource.state === "rejected") {
      const p = Promise.reject(resource.error);
      p.catch(() => null);
      resource.error = getObject(resource.error);
      resource.promise = p;
    }
  }
};
const URLSerializer = {
  prefix: "",
  test: (v) => v instanceof URL,
  serialize: (obj) => obj.href,
  prepare: (data) => new URL(data)
};
const DateSerializer = {
  prefix: "",
  test: (v) => v instanceof Date,
  serialize: (obj) => obj.toISOString(),
  prepare: (data) => new Date(data)
};
const RegexSerializer = {
  prefix: "\x07",
  test: (v) => v instanceof RegExp,
  serialize: (obj) => `${obj.flags} ${obj.source}`,
  prepare: (data) => {
    const space = data.indexOf(" ");
    const source = data.slice(space + 1);
    const flags = data.slice(0, space);
    return new RegExp(source, flags);
  }
};
const ErrorSerializer = {
  prefix: "",
  test: (v) => v instanceof Error,
  serialize: (obj) => {
    return obj.message;
  },
  prepare: (text) => {
    const err = new Error(text);
    err.stack = void 0;
    return err;
  }
};
const DocumentSerializer = {
  prefix: "",
  test: (v) => isDocument(v),
  prepare: (_, _c, doc) => {
    return doc;
  }
};
const SERIALIZABLE_STATE = Symbol("serializable-data");
const ComponentSerializer = {
  prefix: "",
  test: (obj) => isQwikComponent(obj),
  serialize: (obj, getObjId, containerState) => {
    const [qrl] = obj[SERIALIZABLE_STATE];
    return stringifyQRL(qrl, {
      $platform$: containerState.$platform$,
      $getObjId$: getObjId
    });
  },
  prepare: (data, containerState) => {
    const optionsIndex = data.indexOf("{");
    const qrlString = optionsIndex == -1 ? data : data.slice(0, optionsIndex);
    const qrl = parseQRL(qrlString, containerState.$containerEl$);
    return componentQrl(qrl);
  },
  fill: (component, getObject) => {
    const [qrl] = component[SERIALIZABLE_STATE];
    if (qrl.$capture$ && qrl.$capture$.length > 0) {
      qrl.$captureRef$ = qrl.$capture$.map(getObject);
      qrl.$capture$ = null;
    }
  }
};
const PureFunctionSerializer = {
  prefix: "",
  test: (obj) => typeof obj === "function" && obj.__qwik_serializable__ !== void 0,
  serialize: (obj) => {
    return obj.toString();
  },
  prepare: (data) => {
    const fn = new Function("return " + data)();
    fn.__qwik_serializable__ = true;
    return fn;
  },
  fill: void 0
};
const serializers = [
  QRLSerializer,
  WatchSerializer,
  ResourceSerializer,
  URLSerializer,
  DateSerializer,
  RegexSerializer,
  ErrorSerializer,
  DocumentSerializer,
  ComponentSerializer,
  PureFunctionSerializer
];
const canSerialize = (obj) => {
  for (const s of serializers) {
    if (s.test(obj)) {
      return true;
    }
  }
  return false;
};
const serializeValue = (obj, getObjID, containerState) => {
  for (const s of serializers) {
    if (s.test(obj)) {
      let value = s.prefix;
      if (s.serialize) {
        value += s.serialize(obj, getObjID, containerState);
      }
      return value;
    }
  }
  return void 0;
};
const createParser = (getObject, containerState, doc) => {
  const map = /* @__PURE__ */ new Map();
  return {
    prepare(data) {
      for (const s of serializers) {
        const prefix = s.prefix;
        if (data.startsWith(prefix)) {
          const value = s.prepare(data.slice(prefix.length), containerState, doc);
          if (s.fill) {
            map.set(value, s);
          }
          return value;
        }
      }
      return data;
    },
    fill(obj) {
      const serializer = map.get(obj);
      if (serializer) {
        serializer.fill(obj, getObject, containerState);
        return true;
      }
      return false;
    }
  };
};
const QObjectRecursive = 1 << 0;
const QObjectImmutable = 1 << 1;
const getOrCreateProxy = (target, containerState, flags = 0) => {
  const proxy = containerState.$proxyMap$.get(target);
  if (proxy) {
    return proxy;
  }
  return createProxy(target, containerState, flags, void 0);
};
const createProxy = (target, containerState, flags, subs) => {
  assertEqual(unwrapProxy(target), target, "Unexpected proxy at this location", target);
  assertTrue(!containerState.$proxyMap$.has(target), "Proxy was already created", target);
  if (!isObject(target)) {
    throw qError(QError_onlyObjectWrapped, target);
  }
  if (target.constructor !== Object && !isArray(target)) {
    throw qError(QError_onlyLiteralWrapped, target);
  }
  const manager = containerState.$subsManager$.$getLocal$(target, subs);
  const proxy = new Proxy(target, new ReadWriteProxyHandler(containerState, manager, flags));
  containerState.$proxyMap$.set(target, proxy);
  return proxy;
};
const QOjectTargetSymbol = Symbol();
const QOjectFlagsSymbol = Symbol();
class ReadWriteProxyHandler {
  constructor($containerState$, $manager$, $flags$) {
    this.$containerState$ = $containerState$;
    this.$manager$ = $manager$;
    this.$flags$ = $flags$;
  }
  get(target, prop) {
    if (typeof prop === "symbol") {
      if (prop === QOjectTargetSymbol)
        return target;
      if (prop === QOjectFlagsSymbol)
        return this.$flags$;
      return target[prop];
    }
    let subscriber;
    const invokeCtx = tryGetInvokeContext();
    const recursive = (this.$flags$ & QObjectRecursive) !== 0;
    const immutable = (this.$flags$ & QObjectImmutable) !== 0;
    if (invokeCtx) {
      subscriber = invokeCtx.$subscriber$;
    }
    let value = target[prop];
    if (isMutable(value)) {
      value = value.v;
    } else if (immutable) {
      subscriber = null;
    }
    if (subscriber) {
      const isA = isArray(target);
      this.$manager$.$addSub$(subscriber, isA ? void 0 : prop);
    }
    return recursive ? wrap(value, this.$containerState$) : value;
  }
  set(target, prop, newValue) {
    if (typeof prop === "symbol") {
      target[prop] = newValue;
      return true;
    }
    const immutable = (this.$flags$ & QObjectImmutable) !== 0;
    if (immutable) {
      throw qError(QError_immutableProps);
    }
    const recursive = (this.$flags$ & QObjectRecursive) !== 0;
    const unwrappedNewValue = recursive ? unwrapProxy(newValue) : newValue;
    if (qDev$1) {
      verifySerializable(unwrappedNewValue);
      const invokeCtx = tryGetInvokeContext();
      if (invokeCtx && invokeCtx.$event$ === RenderEvent) {
        logWarn("State mutation inside render function. Move mutation to useWatch(), useClientEffect() or useServerMount()", invokeCtx.$hostElement$, prop);
      }
    }
    const isA = isArray(target);
    if (isA) {
      target[prop] = unwrappedNewValue;
      this.$manager$.$notifySubs$();
      return true;
    }
    const oldValue = target[prop];
    if (oldValue !== unwrappedNewValue) {
      target[prop] = unwrappedNewValue;
      this.$manager$.$notifySubs$(prop);
    }
    return true;
  }
  has(target, property) {
    if (property === QOjectTargetSymbol)
      return true;
    if (property === QOjectFlagsSymbol)
      return true;
    return Object.prototype.hasOwnProperty.call(target, property);
  }
  ownKeys(target) {
    let subscriber = null;
    const invokeCtx = tryGetInvokeContext();
    if (invokeCtx) {
      subscriber = invokeCtx.$subscriber$;
    }
    if (subscriber) {
      this.$manager$.$addSub$(subscriber);
    }
    return Object.getOwnPropertyNames(target);
  }
}
const wrap = (value, containerState) => {
  if (isQrl$1(value)) {
    return value;
  }
  if (isObject(value)) {
    if (Object.isFrozen(value)) {
      return value;
    }
    const nakedValue = unwrapProxy(value);
    if (nakedValue !== value) {
      return value;
    }
    if (isNode$1(nakedValue)) {
      return value;
    }
    if (!shouldSerialize(nakedValue)) {
      return value;
    }
    if (qDev$1) {
      verifySerializable(value);
    }
    const proxy = containerState.$proxyMap$.get(value);
    return proxy ? proxy : getOrCreateProxy(value, containerState, QObjectRecursive);
  } else {
    return value;
  }
};
const verifySerializable = (value) => {
  const seen = /* @__PURE__ */ new Set();
  return _verifySerializable(value, seen);
};
const _verifySerializable = (value, seen) => {
  const unwrapped = unwrapProxy(value);
  if (unwrapped == null) {
    return value;
  }
  if (shouldSerialize(unwrapped)) {
    if (seen.has(unwrapped)) {
      return value;
    }
    seen.add(unwrapped);
    if (canSerialize(unwrapped)) {
      return value;
    }
    switch (typeof unwrapped) {
      case "object":
        if (isPromise(unwrapped))
          return value;
        if (isQwikElement(unwrapped))
          return value;
        if (isDocument(unwrapped))
          return value;
        if (isArray(unwrapped)) {
          for (const item of unwrapped) {
            _verifySerializable(item, seen);
          }
          return value;
        }
        if (isSerializableObject(unwrapped)) {
          for (const item of Object.values(unwrapped)) {
            _verifySerializable(item, seen);
          }
          return value;
        }
        break;
      case "boolean":
      case "string":
      case "number":
        return value;
    }
    throw qError(QError_verifySerializable, unwrapped);
  }
  return value;
};
const noSerializeSet = /* @__PURE__ */ new WeakSet();
const shouldSerialize = (obj) => {
  if (isObject(obj) || isFunction(obj)) {
    return !noSerializeSet.has(obj);
  }
  return true;
};
const noSerialize = (input) => {
  if (input != null) {
    noSerializeSet.add(input);
  }
  return input;
};
const mutable = (v) => {
  return {
    [MUTABLE]: true,
    v
  };
};
const isConnected = (sub) => {
  if (isQwikElement(sub)) {
    return !!tryGetContext(sub) || sub.isConnected;
  } else {
    return isConnected(sub.$el$);
  }
};
const MUTABLE = Symbol("mutable");
const isMutable = (v) => {
  return isObject(v) && v[MUTABLE] === true;
};
const unwrapProxy = (proxy) => {
  var _a2;
  return (_a2 = getProxyTarget(proxy)) != null ? _a2 : proxy;
};
const getProxyTarget = (obj) => {
  if (isObject(obj)) {
    return obj[QOjectTargetSymbol];
  }
  return void 0;
};
const getProxyFlags = (obj) => {
  if (isObject(obj)) {
    return obj[QOjectFlagsSymbol];
  }
  return void 0;
};
const Q_CTX = "__ctx__";
const resumeIfNeeded = (containerEl) => {
  const isResumed = directGetAttribute(containerEl, QContainerAttr);
  if (isResumed === "paused") {
    resumeContainer(containerEl);
    if (qDev$1) {
      appendQwikDevTools(containerEl);
    }
  }
};
const appendQwikDevTools = (containerEl) => {
  containerEl["qwik"] = {
    pause: () => pauseContainer(containerEl),
    state: getContainerState(containerEl)
  };
};
const tryGetContext = (element) => {
  return element[Q_CTX];
};
const getContext = (element) => {
  let ctx = tryGetContext(element);
  if (!ctx) {
    element[Q_CTX] = ctx = {
      $dirty$: false,
      $mounted$: false,
      $id$: "",
      $element$: element,
      $cache$: null,
      $refMap$: [],
      $seq$: [],
      $watches$: [],
      $scopeIds$: null,
      $appendStyles$: null,
      $props$: null,
      $renderQrl$: null,
      $component$: null,
      $listeners$: null,
      $contexts$: null
    };
  }
  return ctx;
};
const cleanupContext = (ctx, subsManager) => {
  const el = ctx.$element$;
  ctx.$watches$.forEach((watch) => {
    subsManager.$clearSub$(watch);
    destroyWatch(watch);
  });
  if (ctx.$renderQrl$) {
    subsManager.$clearSub$(el);
  }
  ctx.$component$ = null;
  ctx.$renderQrl$ = null;
  ctx.$seq$.length = 0;
  ctx.$watches$.length = 0;
  ctx.$dirty$ = false;
  el[Q_CTX] = void 0;
};
const PREFIXES = ["document:on", "window:on", "on"];
const SCOPED = ["on-document", "on-window", "on"];
const normalizeOnProp = (prop) => {
  let scope = "on";
  for (let i = 0; i < PREFIXES.length; i++) {
    const prefix = PREFIXES[i];
    if (prop.startsWith(prefix)) {
      scope = SCOPED[i];
      prop = prop.slice(prefix.length);
    }
  }
  if (prop.startsWith("-")) {
    prop = prop.slice(1);
  } else {
    prop = prop.toLowerCase();
  }
  return `${scope}:${prop}`;
};
const createProps = (target, containerState) => {
  return createProxy(target, containerState, QObjectImmutable);
};
const getPropsMutator = (ctx, containerState) => {
  let props = ctx.$props$;
  if (!ctx.$props$) {
    ctx.$props$ = props = createProps({}, containerState);
  }
  const target = getProxyTarget(props);
  assertDefined(target, `props have to be a proxy, but it is not`, props);
  const manager = containerState.$subsManager$.$getLocal$(target);
  return {
    set(prop, value) {
      var _a2, _b;
      const didSet = prop in target;
      let oldValue = target[prop];
      let mut = false;
      if (isMutable(oldValue)) {
        oldValue = oldValue.v;
      }
      if (containerState.$mutableProps$) {
        mut = true;
        if (isMutable(value)) {
          value = value.v;
          target[prop] = value;
        } else {
          target[prop] = mutable(value);
        }
      } else {
        target[prop] = value;
        if (isMutable(value)) {
          value = value.v;
          mut = true;
        }
      }
      if (oldValue !== value) {
        if (qDev$1) {
          if (didSet && !mut && !isQrl$1(value)) {
            const displayName = (_b = (_a2 = ctx.$renderQrl$) == null ? void 0 : _a2.getSymbol()) != null ? _b : ctx.$element$.localName;
            logError(codeToText(QError_immutableJsxProps), `If you need to change a value of a passed in prop, please wrap the prop with "mutable()" <${displayName} ${prop}={mutable(...)}>`, "\n - Component:", displayName, "\n - Prop:", prop, "\n - Old value:", oldValue, "\n - New value:", value);
          }
        }
        manager.$notifySubs$(prop);
      }
    }
  };
};
const STYLE = qDev$1 ? `background: #564CE0; color: white; padding: 2px 3px; border-radius: 2px; font-size: 0.8em;` : "";
const logError = (message, ...optionalParams) => {
  const err = message instanceof Error ? message : new Error(message);
  console.error("%cQWIK ERROR", STYLE, err.message, ...printParams(optionalParams), err.stack);
  return err;
};
const logErrorAndStop = (message, ...optionalParams) => {
  const err = logError(message, ...optionalParams);
  debugger;
  return err;
};
const logWarn = (message, ...optionalParams) => {
  if (qDev$1) {
    console.warn("%cQWIK WARN", STYLE, message, ...printParams(optionalParams));
  }
};
const logDebug = (message, ...optionalParams) => {
  if (qDev$1) {
    console.debug("%cQWIK", STYLE, message, ...printParams(optionalParams));
  }
};
const printParams = (optionalParams) => {
  if (qDev$1) {
    return optionalParams.map((p) => {
      if (isElement$1(p)) {
        return printElement(p);
      }
      return p;
    });
  }
  return optionalParams;
};
const printElement = (el) => {
  var _a2;
  const ctx = tryGetContext(el);
  const isServer2 = /* @__PURE__ */ (() => typeof process !== "undefined" && !!process.versions && !!process.versions.node)();
  return {
    tagName: el.tagName,
    renderQRL: (_a2 = ctx == null ? void 0 : ctx.$renderQrl$) == null ? void 0 : _a2.getSymbol(),
    element: isServer2 ? void 0 : el,
    ctx: isServer2 ? void 0 : ctx
  };
};
const QError_stringifyClassOrStyle = 0;
const QError_runtimeQrlNoElement = 2;
const QError_verifySerializable = 3;
const QError_errorWhileRendering = 4;
const QError_setProperty = 6;
const QError_onlyObjectWrapped = 8;
const QError_onlyLiteralWrapped = 9;
const QError_qrlIsNotFunction = 10;
const QError_notFoundContext = 13;
const QError_useMethodOutsideContext = 14;
const QError_immutableProps = 17;
const QError_hostCanOnlyBeAtRoot = 18;
const QError_immutableJsxProps = 19;
const QError_useInvokeContext = 20;
const QError_containerAlreadyPaused = 21;
const QError_invalidJsxNodeType = 25;
const QError_trackUseStore = 26;
const QError_missingObjectId = 27;
const QError_invalidContext = 28;
const qError = (code, ...parts) => {
  const text = codeToText(code);
  return logErrorAndStop(text, ...parts);
};
const codeToText = (code) => {
  var _a2;
  if (qDev$1) {
    const MAP = [
      "Error while serializing class attribute",
      "Can not serialize a HTML Node that is not an Element",
      "Rruntime but no instance found on element.",
      "Only primitive and object literals can be serialized",
      "Crash while rendering",
      "You can render over a existing q:container. Skipping render().",
      "Set property",
      "Only function's and 'string's are supported.",
      "Only objects can be wrapped in 'QObject'",
      `Only objects literals can be wrapped in 'QObject'`,
      "QRL is not a function",
      "Dynamic import not found",
      "Unknown type argument",
      "not found state for useContext",
      "Invoking 'use*()' method outside of invocation context.",
      "Cant access renderCtx for existing context",
      "Cant access document for existing context",
      "props are inmutable",
      "<div> component can only be used at the root of a Qwik component$()",
      "Props are immutable by default.",
      "use- method must be called only at the root level of a component$()",
      "Container is already paused. Skipping",
      'Components using useServerMount() can only be mounted in the server, if you need your component to be mounted in the client, use "useMount$()" instead',
      "When rendering directly on top of Document, the root node must be a <html>",
      "A <html> node must have 2 children. The first one <head> and the second one a <body>",
      "Invalid JSXNode type. It must be either a function or a string. Found:",
      "Tracking value changes can only be done to useStore() objects and component props",
      "Missing Object ID for captured object",
      "The provided Context reference is not a valid context created by createContext()"
    ];
    return `Code(${code}): ${(_a2 = MAP[code]) != null ? _a2 : ""}`;
  } else {
    return `Code(${code})`;
  }
};
const isQrl$1 = (value) => {
  return typeof value === "function" && typeof value.getSymbol === "function";
};
const createQRL = (chunk, symbol, symbolRef, symbolFn, capture, captureRef, refSymbol) => {
  if (qDev$1) {
    verifySerializable(captureRef);
  }
  let cachedEl;
  const setContainer = (el) => {
    if (!cachedEl) {
      cachedEl = el;
    }
  };
  const resolve = async (el) => {
    if (el) {
      setContainer(el);
    }
    if (symbolRef) {
      return symbolRef;
    }
    if (symbolFn) {
      return symbolRef = symbolFn().then((module) => symbolRef = module[symbol]);
    } else {
      if (!cachedEl) {
        throw new Error(`QRL '${chunk}#${symbol || "default"}' does not have an attached container`);
      }
      const symbol2 = getPlatform(cachedEl).importSymbol(cachedEl, chunk, symbol);
      return symbolRef = then(symbol2, (ref) => {
        return symbolRef = ref;
      });
    }
  };
  const resolveLazy = (el) => {
    return isFunction(symbolRef) ? symbolRef : resolve(el);
  };
  const invokeFn = (el, currentCtx, beforeFn) => {
    return (...args) => {
      const fn = resolveLazy(el);
      return then(fn, (fn2) => {
        if (isFunction(fn2)) {
          const baseContext = currentCtx != null ? currentCtx : newInvokeContext();
          const context = {
            ...baseContext,
            $qrl$: QRL
          };
          if (beforeFn) {
            beforeFn();
          }
          return invoke(context, fn2, ...args);
        }
        throw qError(QError_qrlIsNotFunction);
      });
    };
  };
  const invokeQRL = async function(...args) {
    const fn = invokeFn();
    const result = await fn(...args);
    return result;
  };
  const QRL = invokeQRL;
  const methods = {
    getSymbol: () => refSymbol != null ? refSymbol : symbol,
    getHash: () => getSymbolHash$1(refSymbol != null ? refSymbol : symbol),
    resolve,
    $resolveLazy$: resolveLazy,
    $setContainer$: setContainer,
    $chunk$: chunk,
    $symbol$: symbol,
    $refSymbol$: refSymbol,
    $invokeFn$: invokeFn,
    $capture$: capture,
    $captureRef$: captureRef,
    $copy$() {
      return createQRL(chunk, symbol, symbolRef, symbolFn, null, qrl.$captureRef$, refSymbol);
    },
    $serialize$(options) {
      return stringifyQRL(QRL, options);
    }
  };
  const qrl = Object.assign(invokeQRL, methods);
  return qrl;
};
const getSymbolHash$1 = (symbolName) => {
  const index2 = symbolName.lastIndexOf("_");
  if (index2 > -1) {
    return symbolName.slice(index2 + 1);
  }
  return symbolName;
};
const isSameQRL = (a, b) => {
  return a.getHash() === b.getHash();
};
function assertQrl(qrl) {
  if (qDev$1) {
    if (!isQrl$1(qrl)) {
      throw new Error("Not a QRL");
    }
  }
}
function isElement(value) {
  return isNode(value) && value.nodeType == 1;
}
function isNode(value) {
  return value && typeof value.nodeType == "number";
}
let runtimeSymbolId = 0;
const RUNTIME_QRL = "/runtimeQRL";
const INLINED_QRL = "/inlinedQRL";
const runtimeQrl = (symbol, lexicalScopeCapture = EMPTY_ARRAY) => {
  return createQRL(RUNTIME_QRL, "s" + runtimeSymbolId++, symbol, null, null, lexicalScopeCapture, null);
};
const inlinedQrl = (symbol, symbolName, lexicalScopeCapture = EMPTY_ARRAY) => {
  return createQRL(INLINED_QRL, symbolName, symbol, null, null, lexicalScopeCapture, null);
};
const stringifyQRL = (qrl, opts = {}) => {
  var _a2;
  assertQrl(qrl);
  let symbol = qrl.$symbol$;
  let chunk = qrl.$chunk$;
  const refSymbol = (_a2 = qrl.$refSymbol$) != null ? _a2 : symbol;
  const platform = opts.$platform$;
  const element = opts.$element$;
  if (platform) {
    const result = platform.chunkForSymbol(refSymbol);
    if (result) {
      chunk = result[1];
      if (!qrl.$refSymbol$) {
        symbol = result[0];
      }
    }
  }
  if (chunk.startsWith("./")) {
    chunk = chunk.slice(2);
  }
  const parts = [chunk];
  if (symbol && symbol !== "default") {
    if (chunk === RUNTIME_QRL && qTest) {
      symbol = "_";
    }
    parts.push("#", symbol);
  }
  const capture = qrl.$capture$;
  const captureRef = qrl.$captureRef$;
  if (opts.$getObjId$) {
    if (captureRef && captureRef.length) {
      const capture2 = captureRef.map(opts.$getObjId$);
      parts.push(`[${capture2.join(" ")}]`);
    }
  } else if (opts.$addRefMap$) {
    if (captureRef && captureRef.length) {
      const capture2 = captureRef.map(opts.$addRefMap$);
      parts.push(`[${capture2.join(" ")}]`);
    }
  } else if (capture && capture.length > 0) {
    parts.push(`[${capture.join(" ")}]`);
  }
  const qrlString = parts.join("");
  if (qrl.$chunk$ === RUNTIME_QRL && element) {
    const qrls = element.__qrls__ || (element.__qrls__ = /* @__PURE__ */ new Set());
    qrls.add(qrl);
  }
  return qrlString;
};
const serializeQRLs = (existingQRLs, elCtx) => {
  assertTrue(isElement(elCtx.$element$), "Element must be an actual element");
  const opts = {
    $platform$: getPlatform(elCtx.$element$),
    $element$: elCtx.$element$,
    $addRefMap$: (obj) => addToArray(elCtx.$refMap$, obj)
  };
  return existingQRLs.map((qrl) => stringifyQRL(qrl, opts)).join("\n");
};
const parseQRL = (qrl, el) => {
  const endIdx = qrl.length;
  const hashIdx = indexOf(qrl, 0, "#");
  const captureIdx = indexOf(qrl, hashIdx, "[");
  const chunkEndIdx = Math.min(hashIdx, captureIdx);
  const chunk = qrl.substring(0, chunkEndIdx);
  const symbolStartIdx = hashIdx == endIdx ? hashIdx : hashIdx + 1;
  const symbolEndIdx = captureIdx;
  const symbol = symbolStartIdx == symbolEndIdx ? "default" : qrl.substring(symbolStartIdx, symbolEndIdx);
  const captureStartIdx = captureIdx;
  const captureEndIdx = endIdx;
  const capture = captureStartIdx === captureEndIdx ? EMPTY_ARRAY : qrl.substring(captureStartIdx + 1, captureEndIdx - 1).split(" ");
  if (chunk === RUNTIME_QRL) {
    logError(codeToText(QError_runtimeQrlNoElement), qrl);
  }
  const iQrl = createQRL(chunk, symbol, null, null, capture, null, null);
  if (el) {
    iQrl.$setContainer$(el);
  }
  return iQrl;
};
const indexOf = (text, startIdx, char) => {
  const endIdx = text.length;
  const charIdx = text.indexOf(char, startIdx == endIdx ? 0 : startIdx);
  return charIdx == -1 ? endIdx : charIdx;
};
const addToArray = (array, obj) => {
  const index2 = array.indexOf(obj);
  if (index2 === -1) {
    array.push(obj);
    return array.length - 1;
  }
  return index2;
};
const $ = (expression) => {
  return runtimeQrl(expression);
};
const componentQrl = (onRenderQrl) => {
  function QwikComponent(props, key) {
    const hash = qTest ? "sX" : onRenderQrl.getHash();
    const finalKey = hash + ":" + (key ? key : "");
    return jsx(Virtual, { [OnRenderProp]: onRenderQrl, ...props }, finalKey);
  }
  QwikComponent[SERIALIZABLE_STATE] = [onRenderQrl];
  return QwikComponent;
};
const isQwikComponent = (component) => {
  return typeof component == "function" && component[SERIALIZABLE_STATE] !== void 0;
};
const Slot = (props) => {
  var _a2;
  const name = (_a2 = props.name) != null ? _a2 : "";
  return jsx(Virtual, {
    [QSlotName]: name
  }, name);
};
const version = "0.0.107";
const IS_HEAD = 1 << 0;
const IS_RAW_CONTENT = 1 << 1;
const IS_HTML = 1 << 2;
const renderSSR = async (doc, node, opts) => {
  var _a2;
  const root = opts.containerTagName;
  const containerEl = doc.createElement(root);
  const containerState = getContainerState(containerEl);
  const rctx = createRenderContext(doc, containerState);
  const headNodes = (_a2 = opts.beforeContent) != null ? _a2 : [];
  const ssrCtx = {
    rctx,
    $contexts$: [],
    projectedChildren: void 0,
    projectedContext: void 0,
    hostCtx: void 0,
    invocationContext: void 0,
    headNodes: root === "html" ? headNodes : []
  };
  const containerAttributes = {
    ...opts.containerAttributes,
    "q:container": "paused",
    "q:version": version,
    "q:render": qDev$1 ? "ssr-dev" : "ssr"
  };
  if (opts.base) {
    containerAttributes["q:base"] = opts.base;
  }
  if (opts.url) {
    containerState.$envData$["url"] = opts.url;
  }
  if (opts.envData) {
    Object.assign(containerState.$envData$, opts.envData);
  }
  if (root === "html") {
    node = jsx(root, {
      ...containerAttributes,
      children: [node]
    });
  } else {
    node = jsx(root, {
      ...containerAttributes,
      children: [...headNodes != null ? headNodes : [], node]
    });
  }
  containerState.$hostsRendering$ = /* @__PURE__ */ new Set();
  containerState.$renderPromise$ = Promise.resolve().then(() => renderRoot(node, ssrCtx, opts.stream, containerState, opts));
  await containerState.$renderPromise$;
};
const renderRoot = async (node, ssrCtx, stream, containerState, opts) => {
  const beforeClose = opts.beforeClose;
  await renderNode(node, ssrCtx, stream, 0, (stream2) => {
    const result = beforeClose == null ? void 0 : beforeClose(ssrCtx.$contexts$, containerState);
    if (result) {
      return processData(result, ssrCtx, stream2, 0, void 0);
    }
  });
  if (qDev$1) {
    if (ssrCtx.headNodes.length > 0) {
      logError("Missing <head>. Global styles could not be rendered. Please render a <head> element at the root of the app");
    }
  }
  return ssrCtx.rctx;
};
const renderNodeFunction = (node, ssrCtx, stream, flags, beforeClose) => {
  var _a2;
  if (node.type === SSRComment) {
    stream.write(`<!--${(_a2 = node.props.data) != null ? _a2 : ""}-->`);
    return;
  }
  if (node.type === Virtual) {
    const elCtx = getContext(ssrCtx.rctx.$doc$.createElement(":virtual"));
    return renderNodeVirtual(node, elCtx, void 0, ssrCtx, stream, flags, beforeClose);
  }
  const res = ssrCtx.invocationContext ? invoke(ssrCtx.invocationContext, () => node.type(node.props, node.key)) : node.type(node.props, node.key);
  return processData(res, ssrCtx, stream, flags, beforeClose);
};
const renderNodeVirtual = (node, elCtx, extraNodes, ssrCtx, stream, flags, beforeClose) => {
  var _a2;
  const props = node.props;
  const renderQrl = props[OnRenderProp];
  if (renderQrl) {
    elCtx.$renderQrl$ = renderQrl;
    return renderSSRComponent(ssrCtx, stream, elCtx, node, flags, beforeClose);
  }
  const { children, ...attributes } = node.props;
  const slotName = props[QSlotName];
  const isSlot = typeof slotName === "string";
  if (isSlot) {
    assertDefined((_a2 = ssrCtx.hostCtx) == null ? void 0 : _a2.$id$, "hostId must be defined for a slot");
    attributes[QSlotRef] = ssrCtx.hostCtx.$id$;
  }
  const key = node.key != null ? String(node.key) : null;
  if (key != null) {
    attributes["q:key"] = key;
  }
  const url = new Map(Object.entries(attributes));
  stream.write(`<!--qv ${serializeVirtualAttributes(url)}-->`);
  if (extraNodes) {
    for (const node2 of extraNodes) {
      renderNodeElementSync(node2.type, node2.props, stream);
    }
  }
  const promise = processData(props.children, ssrCtx, stream, flags);
  return then(promise, () => {
    var _a3;
    if (!isSlot && !beforeClose) {
      stream.write(CLOSE_VIRTUAL);
      return;
    }
    let promise2;
    if (isSlot) {
      const content = (_a3 = ssrCtx.projectedChildren) == null ? void 0 : _a3[slotName];
      if (content) {
        ssrCtx.projectedChildren[slotName] = void 0;
        promise2 = processData(content, ssrCtx.projectedContext, stream, flags);
      }
    }
    if (beforeClose) {
      promise2 = then(promise2, () => beforeClose(stream));
    }
    return then(promise2, () => {
      stream.write(CLOSE_VIRTUAL);
    });
  });
};
const CLOSE_VIRTUAL = `<!--/qv-->`;
const renderNodeElement = (node, extraAttributes, extraNodes, ssrCtx, stream, flags, beforeClose) => {
  var _a2;
  const key = node.key != null ? String(node.key) : null;
  const props = node.props;
  const textType = node.type;
  const elCtx = getContext(ssrCtx.rctx.$doc$.createElement(node.type));
  const hasRef = "ref" in props;
  const attributes = updateProperties(elCtx, props);
  const hostCtx = ssrCtx.hostCtx;
  if (hostCtx) {
    attributes["class"] = joinClasses(hostCtx.$scopeIds$, attributes["class"]);
    const cmp = hostCtx.$component$;
    if (!cmp.$attachedListeners$) {
      cmp.$attachedListeners$ = true;
      (_a2 = hostCtx.$listeners$) == null ? void 0 : _a2.forEach((qrl, eventName) => {
        addQRLListener(elCtx, eventName, qrl);
      });
    }
  }
  if (textType === "head") {
    flags |= IS_HEAD;
  }
  const hasEvents = elCtx.$listeners$;
  const isHead = flags & IS_HEAD;
  if (key != null) {
    attributes["q:key"] = key;
  }
  if (hasRef || hasEvents) {
    const newID = getNextIndex(ssrCtx.rctx);
    attributes[ELEMENT_ID] = newID;
    elCtx.$id$ = newID;
    ssrCtx.$contexts$.push(elCtx);
  }
  if (isHead) {
    attributes["q:head"] = "";
  }
  if (extraAttributes) {
    Object.assign(attributes, extraAttributes);
  }
  if (elCtx.$listeners$) {
    elCtx.$listeners$.forEach((value, key2) => {
      attributes[fromCamelToKebabCase(key2)] = serializeQRLs(value, elCtx);
    });
  }
  if (renderNodeElementSync(textType, attributes, stream)) {
    return;
  }
  if (textType !== "head") {
    flags &= ~IS_HEAD;
  }
  if (textType === "html") {
    flags |= IS_HTML;
  } else {
    flags &= ~IS_HTML;
  }
  if (hasRawContent[textType]) {
    flags |= IS_RAW_CONTENT;
  } else {
    flags &= ~IS_RAW_CONTENT;
  }
  if (extraNodes) {
    for (const node2 of extraNodes) {
      renderNodeElementSync(node2.type, node2.props, stream);
    }
  }
  const promise = processData(props.children, ssrCtx, stream, flags);
  return then(promise, () => {
    if (textType === "head") {
      ssrCtx.headNodes.forEach((node2) => {
        renderNodeElementSync(node2.type, node2.props, stream);
      });
      ssrCtx.headNodes.length = 0;
    }
    if (!beforeClose) {
      stream.write(`</${textType}>`);
      return;
    }
    return then(beforeClose(stream), () => {
      stream.write(`</${textType}>`);
    });
  });
};
const renderNodeElementSync = (tagName, attributes, stream) => {
  stream.write(`<${tagName}`);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key !== "dangerouslySetInnerHTML" && key !== "children") {
      if (key === "class" && !value) {
        return;
      }
      const chunk = value === "" ? ` ${key}` : ` ${key}="${escapeAttr(value)}"`;
      stream.write(chunk);
    }
  });
  stream.write(`>`);
  const empty = !!emptyElements[tagName];
  if (empty) {
    return true;
  }
  const innerHTML = attributes.dangerouslySetInnerHTML;
  if (innerHTML) {
    stream.write(innerHTML);
    stream.write(`</${tagName}>`);
    return true;
  }
  return false;
};
const renderSSRComponent = (ssrCtx, stream, elCtx, node, flags, beforeClose) => {
  const attributes = updateComponentProperties(ssrCtx.rctx, elCtx, node.props);
  return then(executeComponent(ssrCtx.rctx, elCtx), (res) => {
    if (!res) {
      logError("component was not rendered during SSR");
      return;
    }
    const hostElement = elCtx.$element$;
    const newCtx = res.rctx;
    let children = node.props.children;
    if (children) {
      if (isArray(children)) {
        if (children.filter(isNotNullable).length === 0) {
          children = void 0;
        }
      } else {
        children = [children];
      }
    }
    const invocationContext = newInvokeContext(newCtx.$doc$, hostElement, void 0);
    invocationContext.$subscriber$ = hostElement;
    invocationContext.$renderCtx$ = newCtx;
    const projectedContext = {
      ...ssrCtx,
      rctx: copyRenderContext(newCtx)
    };
    const newSSrContext = {
      ...ssrCtx,
      projectedChildren: splitProjectedChildren(children, ssrCtx),
      projectedContext,
      rctx: newCtx,
      invocationContext
    };
    const extraNodes = [];
    if (elCtx.$appendStyles$) {
      const isHTML = !!(flags & IS_HTML);
      const array = isHTML ? ssrCtx.headNodes : extraNodes;
      for (const style2 of elCtx.$appendStyles$) {
        array.push(jsx("style", {
          [QStyle]: style2.styleId,
          dangerouslySetInnerHTML: style2.content
        }));
      }
    }
    if (elCtx.$scopeIds$) {
      for (const styleId of elCtx.$scopeIds$) {
      }
      const value = serializeSStyle(elCtx.$scopeIds$);
      if (value) {
        attributes[QScopedStyle] = value;
      }
    }
    const newID = getNextIndex(ssrCtx.rctx);
    attributes[ELEMENT_ID] = newID;
    elCtx.$id$ = newID;
    ssrCtx.$contexts$.push(elCtx);
    const processedNode = jsx(node.type, {
      ...attributes,
      children: res.node
    }, node.key);
    newSSrContext.hostCtx = elCtx;
    return renderNodeVirtual(processedNode, elCtx, extraNodes, newSSrContext, stream, flags, (stream2) => {
      return then(renderQTemplates(newSSrContext, stream2), () => {
        return beforeClose == null ? void 0 : beforeClose(stream2);
      });
    });
  });
};
const renderQTemplates = (ssrContext, stream) => {
  const projectedChildren = ssrContext.projectedChildren;
  if (projectedChildren) {
    const nodes = Object.keys(projectedChildren).map((slotName) => {
      const value = projectedChildren[slotName];
      if (value) {
        return jsx("q:template", {
          [QSlot]: slotName,
          hidden: "",
          "aria-hidden": "true",
          children: value
        });
      }
    });
    return processData(nodes, ssrContext, stream, 0, void 0);
  }
};
const splitProjectedChildren = (children, ssrCtx) => {
  var _a2;
  const flatChildren = flatVirtualChildren(children, ssrCtx);
  if (flatChildren === null) {
    return void 0;
  }
  const slotMap = {};
  for (const child of flatChildren) {
    let slotName = "";
    if (isJSXNode(child)) {
      slotName = (_a2 = child.props[QSlot]) != null ? _a2 : "";
    }
    let array = slotMap[slotName];
    if (!array) {
      slotMap[slotName] = array = [];
    }
    array.push(child);
  }
  return slotMap;
};
const renderNode = (node, ssrCtx, stream, flags, beforeClose) => {
  if (typeof node.type === "string") {
    return renderNodeElement(node, void 0, void 0, ssrCtx, stream, flags, beforeClose);
  } else {
    return renderNodeFunction(node, ssrCtx, stream, flags, beforeClose);
  }
};
const processData = (node, ssrCtx, stream, flags, beforeClose) => {
  if (node == null || typeof node === "boolean") {
    return;
  }
  if (isJSXNode(node)) {
    return renderNode(node, ssrCtx, stream, flags, beforeClose);
  } else if (isPromise(node)) {
    return node.then((node2) => processData(node2, ssrCtx, stream, flags, beforeClose));
  } else if (isArray(node)) {
    node = _flatVirtualChildren(node, ssrCtx);
    return walkChildren(node, ssrCtx, stream, flags);
  } else if (isString(node) || typeof node === "number") {
    if ((flags & IS_RAW_CONTENT) !== 0) {
      stream.write(String(node));
    } else {
      stream.write(escape(String(node)));
    }
  } else {
    logWarn("A unsupported value was passed to the JSX, skipping render. Value:", node);
  }
};
function walkChildren(children, ssrContext, stream, flags) {
  if (children == null) {
    return;
  }
  if (!isArray(children)) {
    return processData(children, ssrContext, stream, flags);
  }
  if (children.length === 1) {
    return processData(children[0], ssrContext, stream, flags);
  }
  if (children.length === 0) {
    return;
  }
  let currentIndex = 0;
  const buffers = [];
  return children.reduce((prevPromise, child, index2) => {
    const buffer = [];
    buffers.push(buffer);
    const localStream = {
      write(chunk) {
        if (currentIndex === index2) {
          stream.write(chunk);
        } else {
          buffer.push(chunk);
        }
      }
    };
    return then(processData(child, ssrContext, localStream, flags), () => {
      return then(prevPromise, () => {
        currentIndex++;
        if (buffers.length > currentIndex) {
          buffers[currentIndex].forEach((chunk) => stream.write(chunk));
        }
      });
    });
  }, void 0);
}
const flatVirtualChildren = (children, ssrCtx) => {
  if (children == null) {
    return null;
  }
  const result = _flatVirtualChildren(children, ssrCtx);
  const nodes = isArray(result) ? result : [result];
  if (nodes.length === 0) {
    return null;
  }
  return nodes;
};
const _flatVirtualChildren = (children, ssrCtx) => {
  if (children == null) {
    return null;
  }
  if (isArray(children)) {
    return children.flatMap((c) => _flatVirtualChildren(c, ssrCtx));
  } else if (isJSXNode(children) && isFunction(children.type) && children.type !== SSRComment && children.type !== Virtual) {
    const fn = children.type;
    const res = ssrCtx.invocationContext ? invoke(ssrCtx.invocationContext, () => fn(children.props, children.key)) : fn(children.props, children.key);
    return flatVirtualChildren(res, ssrCtx);
  }
  return children;
};
const updateProperties = (ctx, expectProps) => {
  const attributes = {};
  if (!expectProps) {
    return attributes;
  }
  const keys = Object.keys(expectProps);
  if (keys.length === 0) {
    return attributes;
  }
  const elm = ctx.$element$;
  for (const key of keys) {
    if (key === "children" || key === OnRenderProp) {
      continue;
    }
    const newValue = expectProps[key];
    if (key === "ref") {
      newValue.current = elm;
      continue;
    }
    if (key.startsWith("data-") || key.startsWith("aria-")) {
      attributes[key] = newValue;
      continue;
    }
    if (isOnProp(key)) {
      const attributeName = normalizeOnProp(key.slice(0, -1));
      addQRLListener(ctx, attributeName, newValue);
      continue;
    }
    setProperty(attributes, key, newValue);
  }
  return attributes;
};
const updateComponentProperties = (rctx, ctx, expectProps) => {
  const attributes = {};
  if (!expectProps) {
    return attributes;
  }
  const keys = Object.keys(expectProps);
  if (keys.length === 0) {
    return attributes;
  }
  const qwikProps = getPropsMutator(ctx, rctx.$containerState$);
  for (const key of keys) {
    if (key === "children" || key === OnRenderProp) {
      continue;
    }
    const newValue = expectProps[key];
    const skipProperty = ALLOWS_PROPS.includes(key);
    if (!skipProperty) {
      qwikProps.set(key, newValue);
      continue;
    }
    setProperty(attributes, key, newValue);
  }
  return attributes;
};
function setProperty(attributes, prop, value) {
  if (value != null && value !== false) {
    prop = processPropKey(prop);
    const attrValue = processPropValue(prop, value, attributes[prop]);
    if (attrValue !== null) {
      attributes[prop] = attrValue;
    }
  }
}
function processPropKey(prop) {
  if (prop === "className") {
    return "class";
  }
  return prop;
}
function processPropValue(prop, value, prevValue) {
  if (prop === "class") {
    const str = joinClasses(value, prevValue);
    return str === "" ? null : str;
  }
  if (prop === "style") {
    return stringifyStyle(value);
  }
  if (value === false || value == null) {
    return null;
  }
  if (value === true) {
    return "";
  }
  return String(value);
}
const hasRawContent = {
  style: true,
  script: true
};
const emptyElements = {
  area: true,
  base: true,
  basefont: true,
  bgsound: true,
  br: true,
  col: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true
};
const escape = (s) => {
  return s.replace(/[&<>\u00A0]/g, (c) => {
    switch (c) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "\xA0":
        return "&nbsp;";
      default:
        return "";
    }
  });
};
const escapeAttr = (s) => {
  const toEscape = /[&"\u00A0]/g;
  if (!toEscape.test(s)) {
    return s;
  } else {
    return s.replace(toEscape, (c) => {
      switch (c) {
        case "&":
          return "&amp;";
        case '"':
          return "&quot;";
        case "\xA0":
          return "&nbsp;";
        default:
          return "";
      }
    });
  }
};
const useStore = (initialState, opts) => {
  var _a2;
  const { get, set, ctx } = useSequentialScope();
  if (get != null) {
    return get;
  }
  const value = isFunction(initialState) ? initialState() : initialState;
  if ((opts == null ? void 0 : opts.reactive) === false) {
    set(value);
    return value;
  } else {
    const containerState = ctx.$renderCtx$.$containerState$;
    const recursive = (_a2 = opts == null ? void 0 : opts.recursive) != null ? _a2 : false;
    const flags = recursive ? QObjectRecursive : 0;
    const newStore = createProxy(value, containerState, flags, void 0);
    set(newStore);
    return newStore;
  }
};
const createContext = (name) => {
  return Object.freeze({
    id: fromCamelToKebabCase(name)
  });
};
const useContextProvider = (context, newValue) => {
  const { get, set, ctx } = useSequentialScope();
  if (get) {
    return;
  }
  if (qDev$1) {
    validateContext(context);
  }
  const hostElement = ctx.$hostElement$;
  const hostCtx = getContext(hostElement);
  let contexts = hostCtx.$contexts$;
  if (!contexts) {
    hostCtx.$contexts$ = contexts = /* @__PURE__ */ new Map();
  }
  if (qDev$1) {
    verifySerializable(newValue);
  }
  contexts.set(context.id, newValue);
  set(true);
};
const useContext = (context) => {
  const { get, set, ctx } = useSequentialScope();
  if (get) {
    return get;
  }
  if (qDev$1) {
    validateContext(context);
  }
  let hostElement = ctx.$hostElement$;
  const contexts = ctx.$renderCtx$.$localStack$;
  for (let i = contexts.length - 1; i >= 0; i--) {
    const ctx2 = contexts[i];
    hostElement = ctx2.$element$;
    if (ctx2.$contexts$) {
      const found = ctx2.$contexts$.get(context.id);
      if (found) {
        set(found);
        return found;
      }
    }
  }
  if (hostElement.closest) {
    const value = queryContextFromDom(hostElement, context.id);
    if (value !== void 0) {
      set(value);
      return value;
    }
  }
  throw qError(QError_notFoundContext, context.id);
};
const queryContextFromDom = (hostElement, contextId) => {
  var _a2;
  let element = hostElement;
  while (element) {
    let node = element;
    let virtual;
    while (node && (virtual = findVirtual(node))) {
      const contexts = (_a2 = tryGetContext(virtual)) == null ? void 0 : _a2.$contexts$;
      if (contexts) {
        if (contexts.has(contextId)) {
          return contexts.get(contextId);
        }
      }
      node = virtual;
    }
    element = element.parentElement;
  }
  return void 0;
};
const findVirtual = (el) => {
  let node = el;
  let stack = 1;
  while (node = node.previousSibling) {
    if (isComment(node)) {
      if (node.data === "/qv") {
        stack++;
      } else if (node.data.startsWith("qv ")) {
        stack--;
        if (stack === 0) {
          return getVirtualElement(node);
        }
      }
    }
  }
  return null;
};
const validateContext = (context) => {
  if (!isObject(context) || typeof context.id !== "string" || context.id.length === 0) {
    throw qError(QError_invalidContext, context);
  }
};
function useEnvData(key, defaultValue) {
  var _a2;
  const ctx = useInvokeContext();
  return (_a2 = ctx.$renderCtx$.$containerState$.$envData$[key]) != null ? _a2 : defaultValue;
}
function scopeStylesheet(css, scopeId) {
  const end = css.length;
  const out = [];
  const stack = [];
  let idx = 0;
  let lastIdx = idx;
  let mode = MODE.rule;
  let lastCh = 0;
  while (idx < end) {
    let ch = css.charCodeAt(idx++);
    if (ch === CHAR.BACKSLASH) {
      idx++;
      ch = CHAR.A;
    }
    const arcs = STATE_MACHINE[mode];
    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const [expectLastCh, expectCh, newMode] = arc;
      if (expectLastCh === lastCh || expectLastCh === CHAR.ANY || expectLastCh === CHAR.IDENT && isIdent(lastCh) || expectLastCh === CHAR.WHITESPACE && isWhiteSpace(lastCh)) {
        if (expectCh === ch || expectCh === CHAR.ANY || expectCh === CHAR.IDENT && isIdent(ch) || expectCh === CHAR.NOT_IDENT && !isIdent(ch) && ch !== CHAR.DOT || expectCh === CHAR.WHITESPACE && isWhiteSpace(ch)) {
          if (arc.length == 3 || lookAhead(arc)) {
            if (arc.length > 3) {
              ch = css.charCodeAt(idx - 1);
            }
            if (newMode === MODE.EXIT || newMode == MODE.EXIT_INSERT_SCOPE) {
              if (newMode === MODE.EXIT_INSERT_SCOPE) {
                if (mode === MODE.starSelector && !shouldNotInsertScoping()) {
                  if (isChainedSelector(ch)) {
                    flush(idx - 2);
                  } else {
                    insertScopingSelector(idx - 2);
                  }
                  lastIdx++;
                } else {
                  if (!isChainedSelector(ch)) {
                    const offset = expectCh == CHAR.NOT_IDENT ? 1 : expectCh == CHAR.CLOSE_PARENTHESIS ? 2 : 0;
                    insertScopingSelector(idx - offset);
                  }
                }
              }
              if (expectCh === CHAR.NOT_IDENT) {
                idx--;
                ch = lastCh;
              }
              do {
                mode = stack.pop() || MODE.rule;
                if (mode === MODE.pseudoGlobal) {
                  flush(idx - 1);
                  lastIdx++;
                }
              } while (isSelfClosingRule(mode));
            } else {
              stack.push(mode);
              if (mode === MODE.pseudoGlobal && newMode === MODE.rule) {
                flush(idx - 8);
                lastIdx = idx;
              } else if (newMode === MODE.pseudoElement) {
                insertScopingSelector(idx - 2);
              }
              mode = newMode;
              ch == CHAR.SPACE;
            }
            break;
          }
        }
      }
    }
    lastCh = ch;
  }
  flush(idx);
  return out.join("");
  function flush(idx2) {
    out.push(css.substring(lastIdx, idx2));
    lastIdx = idx2;
  }
  function insertScopingSelector(idx2) {
    if (mode === MODE.pseudoGlobal || shouldNotInsertScoping())
      return;
    flush(idx2);
    out.push(".", ComponentStylesPrefixContent, scopeId);
  }
  function lookAhead(arc) {
    let prefix = 0;
    if (css.charCodeAt(idx) === CHAR.DASH) {
      for (let i = 1; i < 10; i++) {
        if (css.charCodeAt(idx + i) === CHAR.DASH) {
          prefix = i + 1;
          break;
        }
      }
    }
    words:
      for (let arcIndx = 3; arcIndx < arc.length; arcIndx++) {
        const txt = arc[arcIndx];
        for (let i = 0; i < txt.length; i++) {
          if ((css.charCodeAt(idx + i + prefix) | CHAR.LOWERCASE) !== txt.charCodeAt(i)) {
            continue words;
          }
        }
        idx += txt.length + prefix;
        return true;
      }
    return false;
  }
  function shouldNotInsertScoping() {
    return stack.indexOf(MODE.pseudoGlobal) !== -1 || stack.indexOf(MODE.atRuleSelector) !== -1;
  }
}
function isIdent(ch) {
  return ch >= CHAR._0 && ch <= CHAR._9 || ch >= CHAR.A && ch <= CHAR.Z || ch >= CHAR.a && ch <= CHAR.z || ch >= 128 || ch === CHAR.UNDERSCORE || ch === CHAR.DASH;
}
function isChainedSelector(ch) {
  return ch === CHAR.COLON || ch === CHAR.DOT || ch === CHAR.OPEN_BRACKET || ch === CHAR.HASH || isIdent(ch);
}
function isSelfClosingRule(mode) {
  return mode === MODE.atRuleBlock || mode === MODE.atRuleSelector || mode === MODE.atRuleInert || mode === MODE.pseudoGlobal;
}
function isWhiteSpace(ch) {
  return ch === CHAR.SPACE || ch === CHAR.TAB || ch === CHAR.NEWLINE || ch === CHAR.CARRIAGE_RETURN;
}
var MODE;
(function(MODE2) {
  MODE2[MODE2["rule"] = 0] = "rule";
  MODE2[MODE2["elementClassIdSelector"] = 1] = "elementClassIdSelector";
  MODE2[MODE2["starSelector"] = 2] = "starSelector";
  MODE2[MODE2["pseudoClassWithSelector"] = 3] = "pseudoClassWithSelector";
  MODE2[MODE2["pseudoClass"] = 4] = "pseudoClass";
  MODE2[MODE2["pseudoGlobal"] = 5] = "pseudoGlobal";
  MODE2[MODE2["pseudoElement"] = 6] = "pseudoElement";
  MODE2[MODE2["attrSelector"] = 7] = "attrSelector";
  MODE2[MODE2["inertParenthesis"] = 8] = "inertParenthesis";
  MODE2[MODE2["inertBlock"] = 9] = "inertBlock";
  MODE2[MODE2["atRuleSelector"] = 10] = "atRuleSelector";
  MODE2[MODE2["atRuleBlock"] = 11] = "atRuleBlock";
  MODE2[MODE2["atRuleInert"] = 12] = "atRuleInert";
  MODE2[MODE2["body"] = 13] = "body";
  MODE2[MODE2["stringSingle"] = 14] = "stringSingle";
  MODE2[MODE2["stringDouble"] = 15] = "stringDouble";
  MODE2[MODE2["commentMultiline"] = 16] = "commentMultiline";
  MODE2[MODE2["EXIT"] = 17] = "EXIT";
  MODE2[MODE2["EXIT_INSERT_SCOPE"] = 18] = "EXIT_INSERT_SCOPE";
})(MODE || (MODE = {}));
var CHAR;
(function(CHAR2) {
  CHAR2[CHAR2["ANY"] = 0] = "ANY";
  CHAR2[CHAR2["IDENT"] = 1] = "IDENT";
  CHAR2[CHAR2["NOT_IDENT"] = 2] = "NOT_IDENT";
  CHAR2[CHAR2["WHITESPACE"] = 3] = "WHITESPACE";
  CHAR2[CHAR2["TAB"] = 9] = "TAB";
  CHAR2[CHAR2["NEWLINE"] = 10] = "NEWLINE";
  CHAR2[CHAR2["CARRIAGE_RETURN"] = 13] = "CARRIAGE_RETURN";
  CHAR2[CHAR2["SPACE"] = 32] = "SPACE";
  CHAR2[CHAR2["DOUBLE_QUOTE"] = 34] = "DOUBLE_QUOTE";
  CHAR2[CHAR2["HASH"] = 35] = "HASH";
  CHAR2[CHAR2["SINGLE_QUOTE"] = 39] = "SINGLE_QUOTE";
  CHAR2[CHAR2["OPEN_PARENTHESIS"] = 40] = "OPEN_PARENTHESIS";
  CHAR2[CHAR2["CLOSE_PARENTHESIS"] = 41] = "CLOSE_PARENTHESIS";
  CHAR2[CHAR2["STAR"] = 42] = "STAR";
  CHAR2[CHAR2["COMMA"] = 44] = "COMMA";
  CHAR2[CHAR2["DASH"] = 45] = "DASH";
  CHAR2[CHAR2["DOT"] = 46] = "DOT";
  CHAR2[CHAR2["FORWARD_SLASH"] = 47] = "FORWARD_SLASH";
  CHAR2[CHAR2["_0"] = 48] = "_0";
  CHAR2[CHAR2["_9"] = 57] = "_9";
  CHAR2[CHAR2["COLON"] = 58] = "COLON";
  CHAR2[CHAR2["SEMICOLON"] = 59] = "SEMICOLON";
  CHAR2[CHAR2["LESS_THAN"] = 60] = "LESS_THAN";
  CHAR2[CHAR2["AT"] = 64] = "AT";
  CHAR2[CHAR2["A"] = 65] = "A";
  CHAR2[CHAR2["Z"] = 90] = "Z";
  CHAR2[CHAR2["OPEN_BRACKET"] = 91] = "OPEN_BRACKET";
  CHAR2[CHAR2["CLOSE_BRACKET"] = 93] = "CLOSE_BRACKET";
  CHAR2[CHAR2["BACKSLASH"] = 92] = "BACKSLASH";
  CHAR2[CHAR2["UNDERSCORE"] = 95] = "UNDERSCORE";
  CHAR2[CHAR2["LOWERCASE"] = 32] = "LOWERCASE";
  CHAR2[CHAR2["a"] = 97] = "a";
  CHAR2[CHAR2["d"] = 100] = "d";
  CHAR2[CHAR2["g"] = 103] = "g";
  CHAR2[CHAR2["h"] = 104] = "h";
  CHAR2[CHAR2["i"] = 105] = "i";
  CHAR2[CHAR2["l"] = 108] = "l";
  CHAR2[CHAR2["t"] = 116] = "t";
  CHAR2[CHAR2["z"] = 122] = "z";
  CHAR2[CHAR2["OPEN_BRACE"] = 123] = "OPEN_BRACE";
  CHAR2[CHAR2["CLOSE_BRACE"] = 125] = "CLOSE_BRACE";
})(CHAR || (CHAR = {}));
const STRINGS_COMMENTS = [
  [CHAR.ANY, CHAR.SINGLE_QUOTE, MODE.stringSingle],
  [CHAR.ANY, CHAR.DOUBLE_QUOTE, MODE.stringDouble],
  [CHAR.ANY, CHAR.FORWARD_SLASH, MODE.commentMultiline, "*"]
];
const STATE_MACHINE = [
  [
    [CHAR.ANY, CHAR.STAR, MODE.starSelector],
    [CHAR.ANY, CHAR.OPEN_BRACKET, MODE.attrSelector],
    [CHAR.ANY, CHAR.COLON, MODE.pseudoElement, ":"],
    [CHAR.ANY, CHAR.COLON, MODE.pseudoGlobal, "global"],
    [
      CHAR.ANY,
      CHAR.COLON,
      MODE.pseudoClassWithSelector,
      "has",
      "host-context",
      "not",
      "where",
      "is",
      "matches",
      "any"
    ],
    [CHAR.ANY, CHAR.COLON, MODE.pseudoClass],
    [CHAR.ANY, CHAR.IDENT, MODE.elementClassIdSelector],
    [CHAR.ANY, CHAR.DOT, MODE.elementClassIdSelector],
    [CHAR.ANY, CHAR.HASH, MODE.elementClassIdSelector],
    [CHAR.ANY, CHAR.AT, MODE.atRuleSelector, "keyframe"],
    [CHAR.ANY, CHAR.AT, MODE.atRuleBlock, "media", "supports"],
    [CHAR.ANY, CHAR.AT, MODE.atRuleInert],
    [CHAR.ANY, CHAR.OPEN_BRACE, MODE.body],
    [CHAR.FORWARD_SLASH, CHAR.STAR, MODE.commentMultiline],
    [CHAR.ANY, CHAR.SEMICOLON, MODE.EXIT],
    [CHAR.ANY, CHAR.CLOSE_BRACE, MODE.EXIT],
    [CHAR.ANY, CHAR.CLOSE_PARENTHESIS, MODE.EXIT],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT_INSERT_SCOPE]
  ],
  [
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT_INSERT_SCOPE]
  ],
  [
    [CHAR.ANY, CHAR.OPEN_PARENTHESIS, MODE.rule],
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT_INSERT_SCOPE]
  ],
  [
    [CHAR.ANY, CHAR.OPEN_PARENTHESIS, MODE.inertParenthesis],
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT_INSERT_SCOPE]
  ],
  [
    [CHAR.ANY, CHAR.OPEN_PARENTHESIS, MODE.rule],
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT]
  ],
  [
    [CHAR.ANY, CHAR.NOT_IDENT, MODE.EXIT]
  ],
  [
    [CHAR.ANY, CHAR.CLOSE_BRACKET, MODE.EXIT_INSERT_SCOPE],
    [CHAR.ANY, CHAR.SINGLE_QUOTE, MODE.stringSingle],
    [CHAR.ANY, CHAR.DOUBLE_QUOTE, MODE.stringDouble]
  ],
  [
    [CHAR.ANY, CHAR.CLOSE_PARENTHESIS, MODE.EXIT],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.CLOSE_BRACE, MODE.EXIT],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.CLOSE_BRACE, MODE.EXIT],
    [CHAR.WHITESPACE, CHAR.IDENT, MODE.elementClassIdSelector],
    [CHAR.ANY, CHAR.COLON, MODE.pseudoGlobal, "global"],
    [CHAR.ANY, CHAR.OPEN_BRACE, MODE.body],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.OPEN_BRACE, MODE.rule],
    [CHAR.ANY, CHAR.SEMICOLON, MODE.EXIT],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.SEMICOLON, MODE.EXIT],
    [CHAR.ANY, CHAR.OPEN_BRACE, MODE.inertBlock],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.CLOSE_BRACE, MODE.EXIT],
    [CHAR.ANY, CHAR.OPEN_BRACE, MODE.body],
    [CHAR.ANY, CHAR.OPEN_PARENTHESIS, MODE.inertParenthesis],
    ...STRINGS_COMMENTS
  ],
  [
    [CHAR.ANY, CHAR.SINGLE_QUOTE, MODE.EXIT]
  ],
  [
    [CHAR.ANY, CHAR.DOUBLE_QUOTE, MODE.EXIT]
  ],
  [
    [CHAR.STAR, CHAR.FORWARD_SLASH, MODE.EXIT]
  ]
];
const useStylesQrl = (styles) => {
  _useStyles(styles, (str) => str, false);
};
const useStylesScopedQrl = (styles) => {
  _useStyles(styles, scopeStylesheet, true);
};
const _useStyles = (styleQrl, transform, scoped) => {
  const { get, set, ctx, i } = useSequentialScope();
  if (get) {
    return get;
  }
  const renderCtx = ctx.$renderCtx$;
  const styleId = styleKey(styleQrl, i);
  const hostElement = ctx.$hostElement$;
  const containerState = renderCtx.$containerState$;
  const elCtx = getContext(ctx.$hostElement$);
  set(styleId);
  if (!elCtx.$appendStyles$) {
    elCtx.$appendStyles$ = [];
  }
  if (!elCtx.$scopeIds$) {
    elCtx.$scopeIds$ = [];
  }
  if (scoped) {
    elCtx.$scopeIds$.push(styleContent(styleId));
  }
  if (!hasStyle(containerState, styleId)) {
    containerState.$styleIds$.add(styleId);
    ctx.$waitOn$.push(styleQrl.resolve(hostElement).then((styleText) => {
      elCtx.$appendStyles$.push({
        styleId,
        content: transform(styleText, styleId)
      });
    }));
  }
  return styleId;
};
const layout = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  return /* @__PURE__ */ jsx("div", {
    children: /* @__PURE__ */ jsx(Slot, {})
  });
}, "s_vRVzuC5Gxqo"));
const Layout_ = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: layout
}, Symbol.toStringTag, { value: "Module" }));
const globalContext = createContext("my-context");
const Card = /* @__PURE__ */ componentQrl(inlinedQrl((prosp) => {
  useStylesScopedQrl(inlinedQrl(CardStyle, "s_6oGzOvC7MqU"));
  return /* @__PURE__ */ jsx("div", {
    className: "card",
    children: [
      /* @__PURE__ */ jsx("img", {
        src: prosp.item.image,
        alt: prosp.item.title
      }),
      /* @__PURE__ */ jsx("div", {
        className: "title",
        children: prosp.item.title
      }),
      /* @__PURE__ */ jsx("div", {
        className: "description",
        children: prosp.item.description
      })
    ]
  });
}, "s_WikAbh1oHUE"));
const CardStyle = `
    .card{
        position:relative;
        max-width:600px;
        height:350px;
        display:block;
        background-color:white;
        border-radius:20px;
        padding:1rem
    }
    .title{
        font-weight:500
    }
    .description{
        color:var(--color-2)
    }
    .card img{
        position:relative;
        height: 280px;
        width:100%;
        object-fit: cover;
        border-radius: 20px;
    }
`;
const CardSection = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const state = useContext(globalContext);
  useStylesScopedQrl(inlinedQrl(SectionStyle$1, "s_sZNRTqxzwxw"));
  const listItem = state.items.map((item) => /* @__PURE__ */ jsx("a", {
    href: item.link,
    children: /* @__PURE__ */ jsx(Card, {
      item: mutable(item)
    })
  }));
  return /* @__PURE__ */ jsx("div", {
    className: "section-card",
    children: listItem
  });
}, "s_yUNMrT5gcJo"));
const SectionStyle$1 = `
    .section-card{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        padding: 2rem 20rem;
        gap:1rem
    }
`;
const Input = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(SectionStyle, "s_a9EwQzq9TnE"));
  const state = useContext(globalContext);
  useWatchQrl(inlinedQrl(({ track }) => {
    const [state2] = useLexicalScope();
    const searchInput = track(state2, "src");
    if (!searchInput) {
      state2.items = debouncedGetPeople(void 0);
      state2.loading = false;
      return;
    }
    state2.items = [
      ...debouncedGetPeople(`${state2.src}`)
    ];
  }, "s_wPm7wIpkK5M", [
    state
  ]));
  return /* @__PURE__ */ jsx("div", {
    className: "section",
    children: [
      /* @__PURE__ */ jsx("div", {
        className: "highlight-one",
        children: [
          /* @__PURE__ */ jsx("h1", {
            children: "Popular Pro Stock Vectors"
          }),
          /* @__PURE__ */ jsx("h4", {
            children: [
              "Esta pagina esta hecha con ",
              state.src,
              " ",
              /* @__PURE__ */ jsx("a", {
                style: {
                  "font-weight": 600
                },
                target: "_blank",
                href: "https://qwik.builder.io/",
                children: "Qwik"
              }),
              " ",
              state.src,
              "by",
              " ",
              /* @__PURE__ */ jsx("a", {
                style: {
                  "font-weight": 600
                },
                target: "_blank",
                href: "https://github.com/leifermendez",
                children: "Leifer Mendez"
              })
            ]
          })
        ]
      }),
      /* @__PURE__ */ jsx("div", {
        className: "input-src",
        children: /* @__PURE__ */ jsx("input", {
          onKeyUp$: inlinedQrl((ev) => {
            const [state2] = useLexicalScope();
            return state2.src = ev.target.value;
          }, "s_GVTwofbNpXY", [
            state
          ]),
          placeholder: "Search Pet...",
          type: "text"
        })
      })
    ]
  });
}, "s_GnNtBN4M78Y"));
const getPeople = (searchInput) => {
  const MOCK_DATA = [
    {
      title: `Max`,
      description: "Es un perro alegre y juegueton",
      link: "/1",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
    },
    {
      title: "Marly",
      description: "Es un perro alegre y juegueton",
      link: "",
      image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      title: "Bob",
      description: "Es un perro alegre y juegueton",
      link: "",
      image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80"
    },
    {
      title: "Shadow",
      description: "Es un perro alegre y juegueton",
      link: "",
      image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      title: "Copo",
      description: "Es un perro alegre y juegueton",
      link: "",
      image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
    },
    {
      title: "Rails",
      description: "Es un perro alegre y juegueton",
      link: "",
      image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
    }
  ];
  return searchInput ? MOCK_DATA.filter((item) => item.title.toLowerCase().includes(searchInput)) : MOCK_DATA;
};
const debouncedGetPeople = getPeople;
const SectionStyle = `
    .section h1, .section h4{
        font-weight:400;
        margin:0
    }
    .section h4{
        color:var(--color-3)
    }
    .section{
        display: flex;
        flex-direction: column;
        text-align: center;
        gap:1.3rem
    }
    .highlight-one{
        display:flex;
        flex-direction:column;
        gap:.5rem
    }
    .section h1{
        font-size:3rem;
    }

    .input-src input{
        background: white;
        width: 500px;
        height: 50px;
        border: 0;
        border-radius: 10px;
        padding: 0 0.7rem;
        font-size: 90%;
    }
`;
const index$1 = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const state = useStore({
    src: void 0,
    items: [
      {
        title: "Max",
        description: "Es un perro alegre y juegueton",
        link: "/1",
        image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
      },
      {
        title: "Marly",
        description: "Es un perro alegre y juegueton",
        link: "",
        image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Bob",
        description: "Es un perro alegre y juegueton",
        link: "",
        image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=735&q=80"
      },
      {
        title: "Shadow",
        description: "Es un perro alegre y juegueton",
        link: "",
        image: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8ZG9nfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Copo",
        description: "Es un perro alegre y juegueton",
        link: "",
        image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTN8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Rails",
        description: "Es un perro alegre y juegueton",
        link: "",
        image: "https://images.unsplash.com/photo-1597633425046-08f5110420b5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGRvZ3xlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60"
      }
    ],
    loading: false
  });
  useContextProvider(globalContext, state);
  return /* @__PURE__ */ jsx("div", {
    style: {
      padding: "3rem 0"
    },
    className: "wrapper-body",
    children: [
      /* @__PURE__ */ jsx(Input, {}),
      /* @__PURE__ */ jsx(CardSection, {})
    ]
  });
}, "s_XcCidBDjMKc"));
const Index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index$1
}, Symbol.toStringTag, { value: "Module" }));
const isBrowser = false;
const ContentContext = /* @__PURE__ */ createContext("qc-c");
const ContentInternalContext = /* @__PURE__ */ createContext("qc-ic");
const DocumentHeadContext = /* @__PURE__ */ createContext("qc-h");
const RouteLocationContext = /* @__PURE__ */ createContext("qc-l");
const RouteNavigateContext = /* @__PURE__ */ createContext("qc-n");
const RouterOutlet = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const { contents } = useContext(ContentInternalContext);
  if (contents && contents.length > 0) {
    const contentsLen = contents.length;
    let cmp = jsx(contents[contentsLen - 1].default, {});
    let i = contentsLen - 2;
    for (; i >= 0; i--)
      cmp = jsx(contents[i].default, {
        children: cmp
      });
    return cmp;
  }
  return jsx(SkipRerender, {});
}, "RouterOutlet_component_nd8yk3KO22c"));
const MODULE_CACHE$1 = /* @__PURE__ */ new WeakMap();
const loadRoute$1 = async (routes2, menus2, cacheModules2, pathname) => {
  if (Array.isArray(routes2))
    for (const route of routes2) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getRouteParams$1(route[2], match);
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader$1(menus2, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule$1(moduleLoader, pendingLoads, (routeModule) => mods[i] = routeModule, cacheModules2);
        });
        loadModule$1(menuLoader, pendingLoads, (menuModule) => menu = menuModule == null ? void 0 : menuModule.default, cacheModules2);
        if (pendingLoads.length > 0)
          await Promise.all(pendingLoads);
        return {
          params,
          mods,
          menu
        };
      }
    }
  return null;
};
const loadModule$1 = (moduleLoader, pendingLoads, moduleSetter, cacheModules2) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE$1.get(moduleLoader);
    if (loadedModule)
      moduleSetter(loadedModule);
    else {
      const l = moduleLoader();
      if (typeof l.then === "function")
        pendingLoads.push(l.then((loadedModule2) => {
          if (cacheModules2 !== false)
            MODULE_CACHE$1.set(moduleLoader, loadedModule2);
          moduleSetter(loadedModule2);
        }));
      else if (l)
        moduleSetter(l);
    }
  }
};
const getMenuLoader$1 = (menus2, pathname) => {
  if (menus2) {
    const menu = menus2.find((m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/")));
    if (menu)
      return menu[1];
  }
  return void 0;
};
const getRouteParams$1 = (paramNames, match) => {
  const params = {};
  if (paramNames)
    for (let i = 0; i < paramNames.length; i++)
      params[paramNames[i]] = match ? match[i + 1] : "";
  return params;
};
const resolveHead = (endpoint, routeLocation, contentModules) => {
  const head = createDocumentHead();
  const headProps = {
    data: endpoint ? endpoint.body : null,
    head,
    ...routeLocation
  };
  for (let i = contentModules.length - 1; i >= 0; i--) {
    const contentModuleHead = contentModules[i] && contentModules[i].head;
    if (contentModuleHead) {
      if (typeof contentModuleHead === "function")
        resolveDocumentHead(head, contentModuleHead(headProps));
      else if (typeof contentModuleHead === "object")
        resolveDocumentHead(head, contentModuleHead);
    }
  }
  return headProps.head;
};
const resolveDocumentHead = (resolvedHead, updatedHead) => {
  if (typeof updatedHead.title === "string")
    resolvedHead.title = updatedHead.title;
  mergeArray(resolvedHead.meta, updatedHead.meta);
  mergeArray(resolvedHead.links, updatedHead.links);
  mergeArray(resolvedHead.styles, updatedHead.styles);
};
const mergeArray = (existingArr, newArr) => {
  if (Array.isArray(newArr))
    for (const newItem of newArr) {
      if (typeof newItem.key === "string") {
        const existingIndex = existingArr.findIndex((i) => i.key === newItem.key);
        if (existingIndex > -1) {
          existingArr[existingIndex] = newItem;
          continue;
        }
      }
      existingArr.push(newItem);
    }
};
const createDocumentHead = () => ({
  title: "",
  meta: [],
  links: [],
  styles: []
});
const useDocumentHead = () => useContext(DocumentHeadContext);
const useLocation = () => useContext(RouteLocationContext);
const useNavigate = () => useContext(RouteNavigateContext);
const useQwikCityEnv = () => noSerialize(useEnvData("qwikcity"));
const clientNavigate = (win, routeNavigate) => {
  const currentUrl = win.location;
  const newUrl = toUrl(routeNavigate.path, currentUrl);
  if (isSameOriginDifferentPath(currentUrl, newUrl)) {
    handleScroll(win, currentUrl, newUrl);
    win.history.pushState("", "", toPath(newUrl));
  }
  if (!win[CLIENT_HISTORY_INITIALIZED]) {
    win[CLIENT_HISTORY_INITIALIZED] = 1;
    win.addEventListener("popstate", () => {
      const currentUrl2 = win.location;
      const previousUrl = toUrl(routeNavigate.path, currentUrl2);
      if (isSameOriginDifferentPath(currentUrl2, previousUrl)) {
        handleScroll(win, previousUrl, currentUrl2);
        routeNavigate.path = toPath(currentUrl2);
      }
    });
  }
};
const toPath = (url) => url.pathname + url.search + url.hash;
const toUrl = (url, baseUrl) => new URL(url, baseUrl.href);
const isSameOrigin = (a, b) => a.origin === b.origin;
const isSamePath = (a, b) => toPath(a) === toPath(b);
const isSameOriginDifferentPath = (a, b) => isSameOrigin(a, b) && !isSamePath(a, b);
const getClientNavPath = (props, baseUrl) => {
  const href = props.href;
  if (typeof href === "string" && href.trim() !== "" && typeof props.target !== "string")
    try {
      const linkUrl = toUrl(href, baseUrl);
      const currentUrl = toUrl("", baseUrl);
      if (isSameOrigin(linkUrl, currentUrl))
        return toPath(linkUrl);
    } catch (e) {
      console.error(e);
    }
  return null;
};
const handleScroll = async (win, previousUrl, newUrl) => {
  const doc = win.document;
  const newHash = newUrl.hash;
  if (isSamePath(previousUrl, newUrl)) {
    if (previousUrl.hash !== newHash) {
      await domWait();
      if (newHash)
        scrollToHashId(doc, newHash);
      else
        win.scrollTo(0, 0);
    }
  } else {
    if (newHash)
      for (let i = 0; i < 24; i++) {
        await domWait();
        if (scrollToHashId(doc, newHash))
          break;
      }
  }
};
const domWait = () => new Promise((resolve) => setTimeout(resolve, 12));
const scrollToHashId = (doc, hash) => {
  const elmId = hash.slice(1);
  const elm = doc.getElementById(elmId);
  if (elm)
    elm.scrollIntoView();
  return elm;
};
const CLIENT_HISTORY_INITIALIZED = /* @__PURE__ */ Symbol();
const QwikCity = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const env = useQwikCityEnv();
  if (!(env == null ? void 0 : env.params))
    throw new Error(`Missing Qwik City Env Data`);
  const urlEnv = useEnvData("url");
  if (!urlEnv)
    throw new Error(`Missing Qwik URL Env Data`);
  const url = new URL(urlEnv);
  const routeLocation = useStore({
    href: url.href,
    pathname: url.pathname,
    query: Object.fromEntries(url.searchParams.entries()),
    params: env.params
  });
  const routeNavigate = useStore({
    path: toPath(url)
  });
  const documentHead = useStore(createDocumentHead);
  const content = useStore({
    headings: void 0,
    menu: void 0
  });
  const contentInternal = useStore({
    contents: void 0
  });
  useContextProvider(ContentContext, content);
  useContextProvider(ContentInternalContext, contentInternal);
  useContextProvider(DocumentHeadContext, documentHead);
  useContextProvider(RouteLocationContext, routeLocation);
  useContextProvider(RouteNavigateContext, routeNavigate);
  useWatchQrl(inlinedQrl(async ({ track }) => {
    const [content2, contentInternal2, documentHead2, env2, routeLocation2, routeNavigate2] = useLexicalScope();
    const { routes: routes2, menus: menus2, cacheModules: cacheModules2 } = await Promise.resolve().then(() => _qwikCityPlan);
    const path = track(routeNavigate2, "path");
    const url2 = new URL(path, routeLocation2.href);
    const loadedRoute = await loadRoute$1(routes2, menus2, cacheModules2, url2.pathname);
    if (loadedRoute) {
      const contentModules = loadedRoute.mods;
      const pageModule = contentModules[contentModules.length - 1];
      const resolvedHead = resolveHead(env2 == null ? void 0 : env2.response, routeLocation2, contentModules);
      documentHead2.links = resolvedHead.links;
      documentHead2.meta = resolvedHead.meta;
      documentHead2.styles = resolvedHead.styles;
      documentHead2.title = resolvedHead.title;
      content2.headings = pageModule.headings;
      content2.menu = loadedRoute.menu;
      contentInternal2.contents = noSerialize(contentModules);
      routeLocation2.href = url2.href;
      routeLocation2.pathname = url2.pathname;
      routeLocation2.params = {
        ...loadedRoute.params
      };
      routeLocation2.query = Object.fromEntries(url2.searchParams.entries());
      if (isBrowser)
        clientNavigate(window, routeNavigate2);
    }
  }, "QwikCity_component_useWatch_AaAlzKH0KlQ", [
    content,
    contentInternal,
    documentHead,
    env,
    routeLocation,
    routeNavigate
  ]));
  return /* @__PURE__ */ jsx(Slot, {});
}, "QwikCity_component_z1nvHyEppoI"));
/* @__PURE__ */ componentQrl(inlinedQrl((props) => {
  const nav = useNavigate();
  const loc = useLocation();
  const linkProps = {
    ...props
  };
  const clientNavPath = getClientNavPath(linkProps, loc);
  if (clientNavPath) {
    linkProps["preventdefault:click"] = true;
    linkProps.href = clientNavPath;
  }
  return /* @__PURE__ */ jsx("a", {
    ...linkProps,
    onClick$: inlinedQrl(() => {
      const [clientNavPath2, linkProps2, nav2] = useLexicalScope();
      if (clientNavPath2)
        nav2.path = linkProps2.href;
    }, "Link_component_a_onClick_hA9UPaY8sNQ", [
      clientNavPath,
      linkProps,
      nav
    ]),
    onMouseOver$: inlinedQrl(() => {
      const [clientNavPath2] = useLexicalScope();
      if (clientNavPath2) {
        const data = {
          links: [
            clientNavPath2
          ]
        };
        dispatchEvent(new CustomEvent("qprefetch", {
          detail: data
        }));
      }
    }, "Link_component_a_onMouseOver_skxgNVWVOT8", [
      clientNavPath
    ]),
    children: /* @__PURE__ */ jsx(Slot, {})
  });
}, "Link_component_mYsiJcA4IBc"));
const index = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const state = useStore({
    item: {
      title: "Max",
      description: "Es un perro alegre y juegueton",
      link: "/1",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
    }
  });
  const { params } = useLocation();
  return /* @__PURE__ */ jsx("div", {
    children: [
      /* @__PURE__ */ jsx("div", {
        children: [
          "MyCmp ",
          params.id
        ]
      }),
      /* @__PURE__ */ jsx(Card, {
        item: state.item
      })
    ]
  });
}, "s_26e99OMlrIo"));
const Id = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: index
}, Symbol.toStringTag, { value: "Module" }));
const Layout = () => Layout_;
const routes = [
  [/^\/$/, [Layout, () => Index], void 0, "/"],
  [/^\/([^/]+?)\/?$/, [Layout, () => Id], ["id"], "/[id]"]
];
const menus = [];
const trailingSlash = false;
const basePathname = "/";
const cacheModules = true;
const _qwikCityPlan = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  routes,
  menus,
  trailingSlash,
  basePathname,
  cacheModules
}, Symbol.toStringTag, { value: "Module" }));
var HEADERS = Symbol("headers");
var _a;
var HeadersPolyfill = class {
  constructor() {
    this[_a] = {};
  }
  [(_a = HEADERS, Symbol.iterator)]() {
    return this.entries();
  }
  *keys() {
    for (const name of Object.keys(this[HEADERS])) {
      yield name;
    }
  }
  *values() {
    for (const value of Object.values(this[HEADERS])) {
      yield value;
    }
  }
  *entries() {
    for (const name of Object.keys(this[HEADERS])) {
      yield [name, this.get(name)];
    }
  }
  get(name) {
    return this[HEADERS][normalizeHeaderName(name)] || null;
  }
  set(name, value) {
    const normalizedName = normalizeHeaderName(name);
    this[HEADERS][normalizedName] = typeof value !== "string" ? String(value) : value;
  }
  append(name, value) {
    const normalizedName = normalizeHeaderName(name);
    const resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${value}` : value;
    this.set(name, resolvedValue);
  }
  delete(name) {
    if (!this.has(name)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    delete this[HEADERS][normalizedName];
  }
  all() {
    return this[HEADERS];
  }
  has(name) {
    return this[HEADERS].hasOwnProperty(normalizeHeaderName(name));
  }
  forEach(callback, thisArg) {
    for (const name in this[HEADERS]) {
      if (this[HEADERS].hasOwnProperty(name)) {
        callback.call(thisArg, this[HEADERS][name], name, this);
      }
    }
  }
};
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
  if (typeof name !== "string") {
    name = String(name);
  }
  if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") {
    throw new TypeError("Invalid character in header field name");
  }
  return name.toLowerCase();
}
function createHeaders() {
  return new (typeof Headers === "function" ? Headers : HeadersPolyfill)();
}
var ErrorResponse = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
};
function notFoundHandler(requestCtx) {
  return errorResponse(requestCtx, new ErrorResponse(404, "Not Found"));
}
function errorHandler(requestCtx, e) {
  const status = 500;
  let message = "Server Error";
  let stack = void 0;
  if (e != null) {
    if (typeof e === "object") {
      if (typeof e.message === "string") {
        message = e.message;
      }
      if (e.stack != null) {
        stack = String(e.stack);
      }
    } else {
      message = String(e);
    }
  }
  const html = minimalHtmlResponse(status, message, stack);
  const headers = createHeaders();
  headers.set("Content-Type", "text/html; charset=utf-8");
  return requestCtx.response(
    status,
    headers,
    async (stream) => {
      stream.write(html);
    },
    e
  );
}
function errorResponse(requestCtx, errorResponse2) {
  const html = minimalHtmlResponse(
    errorResponse2.status,
    errorResponse2.message,
    errorResponse2.stack
  );
  const headers = createHeaders();
  headers.set("Content-Type", "text/html; charset=utf-8");
  return requestCtx.response(
    errorResponse2.status,
    headers,
    async (stream) => {
      stream.write(html);
    },
    errorResponse2
  );
}
function minimalHtmlResponse(status, message, stack) {
  const width = typeof message === "string" ? "600px" : "300px";
  const color = status >= 500 ? COLOR_500 : COLOR_400;
  if (status < 500) {
    stack = "";
  }
  return `<!DOCTYPE html>
<html data-qwik-city-status="${status}">
<head>
  <meta charset="utf-8">
  <title>${status} ${message}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { color: ${color}; background-color: #fafafa; padding: 30px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    p { max-width: ${width}; margin: 60px auto 30px auto; background: white; border-radius: 5px; box-shadow: 0px 0px 50px -20px ${color}; overflow: hidden; }
    strong { display: inline-block; padding: 15px; background: ${color}; color: white; }
    span { display: inline-block; padding: 15px; }
    pre { max-width: 580px; margin: 0 auto; }
  </style>
</head>
<body>
  <p>
    <strong>${status}</strong>
    <span>${message}</span>
  </p>
  ${stack ? `<pre><code>${stack}</code></pre>` : ``}
</body>
</html>
`;
}
var COLOR_400 = "#5249d9";
var COLOR_500 = "#bd16bd";
var MODULE_CACHE = /* @__PURE__ */ new WeakMap();
var loadRoute = async (routes2, menus2, cacheModules2, pathname) => {
  if (Array.isArray(routes2)) {
    for (const route of routes2) {
      const match = route[0].exec(pathname);
      if (match) {
        const loaders = route[1];
        const params = getRouteParams(route[2], match);
        const mods = new Array(loaders.length);
        const pendingLoads = [];
        const menuLoader = getMenuLoader(menus2, pathname);
        let menu = void 0;
        loaders.forEach((moduleLoader, i) => {
          loadModule(
            moduleLoader,
            pendingLoads,
            (routeModule) => mods[i] = routeModule,
            cacheModules2
          );
        });
        loadModule(
          menuLoader,
          pendingLoads,
          (menuModule) => menu = menuModule == null ? void 0 : menuModule.default,
          cacheModules2
        );
        if (pendingLoads.length > 0) {
          await Promise.all(pendingLoads);
        }
        return { params, mods, menu };
      }
    }
  }
  return null;
};
var loadModule = (moduleLoader, pendingLoads, moduleSetter, cacheModules2) => {
  if (typeof moduleLoader === "function") {
    const loadedModule = MODULE_CACHE.get(moduleLoader);
    if (loadedModule) {
      moduleSetter(loadedModule);
    } else {
      const l = moduleLoader();
      if (typeof l.then === "function") {
        pendingLoads.push(
          l.then((loadedModule2) => {
            if (cacheModules2 !== false) {
              MODULE_CACHE.set(moduleLoader, loadedModule2);
            }
            moduleSetter(loadedModule2);
          })
        );
      } else if (l) {
        moduleSetter(l);
      }
    }
  }
};
var getMenuLoader = (menus2, pathname) => {
  if (menus2) {
    const menu = menus2.find(
      (m) => m[0] === pathname || pathname.startsWith(m[0] + (pathname.endsWith("/") ? "" : "/"))
    );
    if (menu) {
      return menu[1];
    }
  }
  return void 0;
};
var getRouteParams = (paramNames, match) => {
  const params = {};
  if (paramNames) {
    for (let i = 0; i < paramNames.length; i++) {
      params[paramNames[i]] = match ? match[i + 1] : "";
    }
  }
  return params;
};
var RedirectResponse = class {
  constructor(url, status, headers) {
    this.url = url;
    this.location = url;
    this.status = isRedirectStatus(status) ? status : 307;
    this.headers = headers || createHeaders();
    this.headers.set("Location", this.location);
    this.headers.delete("Cache-Control");
  }
};
function redirectResponse(requestCtx, responseRedirect) {
  return requestCtx.response(responseRedirect.status, responseRedirect.headers, async () => {
  });
}
function isRedirectStatus(status) {
  return typeof status === "number" && status >= 301 && status <= 308;
}
async function loadUserResponse(requestCtx, params, routeModules, platform, trailingSlash2, basePathname2 = "/") {
  const { request, url } = requestCtx;
  const { pathname } = url;
  const userResponse = {
    type: "endpoint",
    url,
    params,
    status: 200,
    headers: createHeaders(),
    resolvedBody: void 0,
    pendingBody: void 0
  };
  let hasRequestMethodHandler = false;
  const hasPageRenderer = isLastModulePageRoute(routeModules);
  if (hasPageRenderer && pathname !== basePathname2) {
    if (trailingSlash2) {
      if (!pathname.endsWith("/")) {
        throw new RedirectResponse(pathname + "/" + url.search, 307);
      }
    } else {
      if (pathname.endsWith("/")) {
        throw new RedirectResponse(
          pathname.slice(0, pathname.length - 1) + url.search,
          307
        );
      }
    }
  }
  let middlewareIndex = -1;
  const abort = () => {
    middlewareIndex = ABORT_INDEX;
  };
  const redirect = (url2, status) => {
    return new RedirectResponse(url2, status, userResponse.headers);
  };
  const error = (status, message) => {
    return new ErrorResponse(status, message);
  };
  const next = async () => {
    middlewareIndex++;
    while (middlewareIndex < routeModules.length) {
      const endpointModule = routeModules[middlewareIndex];
      let reqHandler = void 0;
      switch (request.method) {
        case "GET": {
          reqHandler = endpointModule.onGet;
          break;
        }
        case "POST": {
          reqHandler = endpointModule.onPost;
          break;
        }
        case "PUT": {
          reqHandler = endpointModule.onPut;
          break;
        }
        case "PATCH": {
          reqHandler = endpointModule.onPatch;
          break;
        }
        case "OPTIONS": {
          reqHandler = endpointModule.onOptions;
          break;
        }
        case "HEAD": {
          reqHandler = endpointModule.onHead;
          break;
        }
        case "DELETE": {
          reqHandler = endpointModule.onDelete;
          break;
        }
      }
      reqHandler = reqHandler || endpointModule.onRequest;
      if (typeof reqHandler === "function") {
        hasRequestMethodHandler = true;
        const response = {
          get status() {
            return userResponse.status;
          },
          set status(code) {
            userResponse.status = code;
          },
          get headers() {
            return userResponse.headers;
          },
          redirect,
          error
        };
        const requestEv = {
          request,
          url: new URL(url),
          params: { ...params },
          response,
          platform,
          next,
          abort
        };
        const syncData = reqHandler(requestEv);
        if (typeof syncData === "function") {
          userResponse.pendingBody = createPendingBody(syncData);
        } else if (syncData !== null && typeof syncData === "object" && typeof syncData.then === "function") {
          const asyncResolved = await syncData;
          if (typeof asyncResolved === "function") {
            userResponse.pendingBody = createPendingBody(asyncResolved);
          } else {
            userResponse.resolvedBody = asyncResolved;
          }
        } else {
          userResponse.resolvedBody = syncData;
        }
      }
      middlewareIndex++;
    }
  };
  await next();
  if (isRedirectStatus(userResponse.status) && userResponse.headers.has("Location")) {
    throw new RedirectResponse(
      userResponse.headers.get("Location"),
      userResponse.status,
      userResponse.headers
    );
  }
  if (hasPageRenderer && request.headers.get("Accept") !== "application/json") {
    userResponse.type = "page";
  } else {
    if (!hasRequestMethodHandler) {
      throw new ErrorResponse(405, `Method Not Allowed`);
    }
  }
  return userResponse;
}
function createPendingBody(cb) {
  return new Promise((resolve, reject) => {
    try {
      const rtn = cb();
      if (rtn !== null && typeof rtn === "object" && typeof rtn.then === "function") {
        rtn.then(resolve, reject);
      } else {
        resolve(rtn);
      }
    } catch (e) {
      reject(e);
    }
  });
}
function isLastModulePageRoute(routeModules) {
  const lastRouteModule = routeModules[routeModules.length - 1];
  return lastRouteModule && typeof lastRouteModule.default === "function";
}
var ABORT_INDEX = 999999999;
function endpointHandler(requestCtx, userResponse) {
  const { pendingBody, resolvedBody, status, headers } = userResponse;
  const { response } = requestCtx;
  if (pendingBody === void 0 && resolvedBody === void 0) {
    return response(status, headers, asyncNoop);
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json; charset=utf-8");
  }
  const isJson = headers.get("Content-Type").includes("json");
  return response(status, headers, async ({ write }) => {
    const body = pendingBody !== void 0 ? await pendingBody : resolvedBody;
    if (body !== void 0) {
      if (isJson) {
        write(JSON.stringify(body));
      } else {
        const type = typeof body;
        if (type === "string") {
          write(body);
        } else if (type === "number" || type === "boolean") {
          write(String(body));
        } else {
          write(body);
        }
      }
    }
  });
}
var asyncNoop = async () => {
};
function pageHandler(requestCtx, userResponse, render2, opts) {
  const { status, headers } = userResponse;
  const { response } = requestCtx;
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "text/html; charset=utf-8");
  }
  return response(status, headers, async (stream) => {
    const result = await render2({
      stream,
      envData: getQwikCityEnvData(userResponse),
      ...opts
    });
    if ((typeof result).html === "string") {
      stream.write(result.html);
    }
  });
}
function getQwikCityEnvData(userResponse) {
  const { url, params, pendingBody, resolvedBody, status } = userResponse;
  return {
    url: url.href,
    qwikcity: {
      params: { ...params },
      response: {
        body: pendingBody || resolvedBody,
        status
      }
    }
  };
}
async function requestHandler(requestCtx, render2, platform, opts) {
  try {
    const pathname = requestCtx.url.pathname;
    const loadedRoute = await loadRoute(routes, menus, cacheModules, pathname);
    if (loadedRoute) {
      const { mods, params } = loadedRoute;
      const userResponse = await loadUserResponse(
        requestCtx,
        params,
        mods,
        platform,
        trailingSlash,
        basePathname
      );
      if (userResponse.type === "endpoint") {
        return endpointHandler(requestCtx, userResponse);
      }
      return pageHandler(requestCtx, userResponse, render2, opts);
    }
  } catch (e) {
    if (e instanceof RedirectResponse) {
      return redirectResponse(requestCtx, e);
    }
    if (e instanceof ErrorResponse) {
      return errorResponse(requestCtx, e);
    }
    return errorHandler(requestCtx, e);
  }
  return null;
}
function qwikCity(render2, opts) {
  async function onRequest(request, { next }) {
    try {
      const requestCtx = {
        url: new URL(request.url),
        request,
        response: (status, headers, body) => {
          return new Promise((resolve) => {
            let flushedHeaders = false;
            const { readable, writable } = new TransformStream();
            const writer = writable.getWriter();
            const response = new Response(readable, { status, headers });
            body({
              write: (chunk) => {
                if (!flushedHeaders) {
                  flushedHeaders = true;
                  resolve(response);
                }
                if (typeof chunk === "string") {
                  const encoder = new TextEncoder();
                  writer.write(encoder.encode(chunk));
                } else {
                  writer.write(chunk);
                }
              }
            }).finally(() => {
              if (!flushedHeaders) {
                flushedHeaders = true;
                resolve(response);
              }
              writer.close();
            });
          });
        }
      };
      const handledResponse = await requestHandler(requestCtx, render2, {}, opts);
      if (handledResponse) {
        return handledResponse;
      }
      const nextResponse = await next();
      if (nextResponse.status === 404) {
        const handledResponse2 = await requestHandler(requestCtx, render2, {}, opts);
        if (handledResponse2) {
          return handledResponse2;
        }
        const notFoundResponse = await notFoundHandler(requestCtx);
        return notFoundResponse;
      }
      return nextResponse;
    } catch (e) {
      return new Response(String(e || "Error"), {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }
  }
  return onRequest;
}
/**
 * @license
 * @builder.io/qwik/server 0.0.107
 * Copyright Builder.io, Inc. All Rights Reserved.
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/BuilderIO/qwik/blob/main/LICENSE
 */
if (typeof global == "undefined") {
  const g = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" != typeof self ? self : {};
  g.global = g;
}
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
function createTimer() {
  if (typeof performance === "undefined") {
    return () => 0;
  }
  const start = performance.now();
  return () => {
    const end = performance.now();
    const delta = end - start;
    return delta / 1e6;
  };
}
function getBuildBase(opts) {
  let base = opts.base;
  if (typeof base === "string") {
    if (!base.endsWith("/")) {
      base += "/";
    }
    return base;
  }
  return "/build/";
}
function createPlatform(document2, opts, mapper) {
  if (!document2 || document2.nodeType !== 9) {
    throw new Error(`Invalid Document implementation`);
  }
  const mapperFn = opts.symbolMapper ? opts.symbolMapper : (symbolName) => {
    if (mapper) {
      const hash = getSymbolHash(symbolName);
      const result = mapper[hash];
      if (!result) {
        console.error("Cannot resolve symbol", symbolName, "in", mapper);
      }
      return result;
    }
  };
  const serverPlatform = {
    isServer: true,
    async importSymbol(_element, qrl, symbolName) {
      let [modulePath] = String(qrl).split("#");
      if (!modulePath.endsWith(".js")) {
        modulePath += ".js";
      }
      const module = __require(modulePath);
      if (!(symbolName in module)) {
        throw new Error(`Q-ERROR: missing symbol '${symbolName}' in module '${modulePath}'.`);
      }
      const symbol = module[symbolName];
      return symbol;
    },
    raf: () => {
      console.error("server can not rerender");
      return Promise.resolve();
    },
    nextTick: (fn) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(fn());
        });
      });
    },
    chunkForSymbol(symbolName) {
      return mapperFn(symbolName, mapper);
    }
  };
  return serverPlatform;
}
async function setServerPlatform(document2, opts, mapper) {
  const platform = createPlatform(document2, opts, mapper);
  setPlatform(document2, platform);
}
var getSymbolHash = (symbolName) => {
  const index2 = symbolName.lastIndexOf("_");
  if (index2 > -1) {
    return symbolName.slice(index2 + 1);
  }
  return symbolName;
};
var QWIK_LOADER_DEFAULT_MINIFIED = '(()=>{function e(e){return"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag]}((t,n)=>{const o="__q_context__",r=(e,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),t.querySelectorAll("[on"+e+"\\\\:"+n+"]").forEach((t=>c(t,e,n,o)))},s=(e,t,n)=>e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0})),i=e=>{throw Error("QWIK "+e)},a=(e,n)=>(e=e.closest("[q\\\\:container]"),new URL(n,new URL(e?e.getAttribute("q:base"):t.baseURI,t.baseURI))),c=async(n,r,c,b)=>{n.hasAttribute("preventdefault:"+c)&&b.preventDefault();const u=n.getAttribute("on"+r+":"+c);if(u)for(const r of u.split("\\n")){const c=a(n,r);if(c){const r=l(c),a=(window[c.pathname]||(d=await import(c.href.split("#")[0]),Object.values(d).find(e)||d))[r]||i(c+" does not export "+r),u=t[o];if(n.isConnected)try{t[o]=[n,b,c],a(b,n,c)}finally{t[o]=u,s(n,"qsymbol",r)}}}var d},l=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",b=(e,t)=>{for(t=e.target,r("-document",e.type,e);t&&t.getAttribute;)c(t,"",e.type,e),t=e.bubbles?t.parentElement:null},u=e=>{e.target,r("-window",e.type,e)},d=e=>{if(e=t.readyState,!n&&("interactive"==e||"complete"==e)&&(n=1,r("","qinit",new CustomEvent("qinit")),"undefined"!=typeof IntersectionObserver)){const e=new IntersectionObserver((t=>{for(const n of t)n.isIntersecting&&(e.unobserve(n.target),c(n.target,"","qvisible",new CustomEvent("qvisible",{bubbles:!1,detail:n})))}));t.qO=e,t.querySelectorAll("[on\\\\:qvisible]").forEach((t=>e.observe(t)))}},f=e=>{document.addEventListener(e,b,{capture:!0}),window.addEventListener(e,u)};if(!t.qR){t.qR=1;{const e=t.querySelector("script[events]");if(e)e.getAttribute("events").split(/[\\s,;]+/).forEach(f);else for(const e in t)e.startsWith("on")&&f(e.slice(2))}t.addEventListener("readystatechange",d),d()}})(document)})();';
var QWIK_LOADER_DEFAULT_DEBUG = '(() => {\n    function findModule(module) {\n        return Object.values(module).find(isModule) || module;\n    }\n    function isModule(module) {\n        return "object" == typeof module && module && "Module" === module[Symbol.toStringTag];\n    }\n    ((doc, hasInitialized, prefetchWorker) => {\n        const broadcast = (infix, type, ev) => {\n            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, type, ev)));\n        };\n        const emitEvent = (el, eventName, detail) => el.dispatchEvent(new CustomEvent(eventName, {\n            detail: detail,\n            bubbles: !0,\n            composed: !0\n        }));\n        const error = msg => {\n            throw new Error("QWIK " + msg);\n        };\n        const qrlResolver = (element, qrl) => {\n            element = element.closest("[q\\\\:container]");\n            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));\n        };\n        const dispatch = async (element, onPrefix, eventName, ev) => {\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            const attrValue = element.getAttribute("on" + onPrefix + ":" + eventName);\n            if (attrValue) {\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = qrlResolver(element, qrl);\n                    if (url) {\n                        const symbolName = getSymbolName(url);\n                        const handler = (window[url.pathname] || findModule(await import(url.href.split("#")[0])))[symbolName] || error(url + " does not export " + symbolName);\n                        const previousCtx = doc.__q_context__;\n                        if (element.isConnected) {\n                            try {\n                                doc.__q_context__ = [ element, ev, url ];\n                                handler(ev, element, url);\n                            } finally {\n                                doc.__q_context__ = previousCtx;\n                                emitEvent(element, "qsymbol", symbolName);\n                            }\n                        }\n                    }\n                }\n            }\n        };\n        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n        const processDocumentEvent = (ev, element) => {\n            element = ev.target;\n            broadcast("-document", ev.type, ev);\n            while (element && element.getAttribute) {\n                dispatch(element, "", ev.type, ev);\n                element = ev.bubbles ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = (ev, element) => {\n            ev.target;\n            broadcast("-window", ev.type, ev);\n        };\n        const processReadyStateChange = readyState => {\n            readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                hasInitialized = 1;\n                broadcast("", "qinit", new CustomEvent("qinit"));\n                if ("undefined" != typeof IntersectionObserver) {\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", "qvisible", new CustomEvent("qvisible", {\n                                    bubbles: !1,\n                                    detail: entry\n                                }));\n                            }\n                        }\n                    }));\n                    doc.qO = observer;\n                    doc.querySelectorAll("[on\\\\:qvisible]").forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const addDocEventListener = eventName => {\n            document.addEventListener(eventName, processDocumentEvent, {\n                capture: !0\n            });\n            window.addEventListener(eventName, processWindowEvent);\n        };\n        if (!doc.qR) {\n            doc.qR = 1;\n            {\n                const scriptTag = doc.querySelector("script[events]");\n                if (scriptTag) {\n                    scriptTag.getAttribute("events").split(/[\\s,;]+/).forEach(addDocEventListener);\n                } else {\n                    for (const key in doc) {\n                        key.startsWith("on") && addDocEventListener(key.slice(2));\n                    }\n                }\n            }\n            doc.addEventListener("readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})();';
var QWIK_LOADER_OPTIMIZE_MINIFIED = '(()=>{function e(e){return"object"==typeof e&&e&&"Module"===e[Symbol.toStringTag]}((t,n)=>{const o="__q_context__",r=(e,n,o)=>{n=n.replace(/([A-Z])/g,(e=>"-"+e.toLowerCase())),t.querySelectorAll("[on"+e+"\\\\:"+n+"]").forEach((t=>c(t,e,n,o)))},s=(e,t,n)=>e.dispatchEvent(new CustomEvent(t,{detail:n,bubbles:!0,composed:!0})),i=e=>{throw Error("QWIK "+e)},a=(e,n)=>(e=e.closest("[q\\\\:container]"),new URL(n,new URL(e?e.getAttribute("q:base"):t.baseURI,t.baseURI))),c=async(n,r,c,b)=>{n.hasAttribute("preventdefault:"+c)&&b.preventDefault();const d=n.getAttribute("on"+r+":"+c);if(d)for(const r of d.split("\\n")){const c=a(n,r);if(c){const r=l(c),a=(window[c.pathname]||(u=await import(c.href.split("#")[0]),Object.values(u).find(e)||u))[r]||i(c+" does not export "+r),d=t[o];if(n.isConnected)try{t[o]=[n,b,c],a(b,n,c)}finally{t[o]=d,s(n,"qsymbol",r)}}}var u},l=e=>e.hash.replace(/^#?([^?[|]*).*$/,"$1")||"default",b=(e,t)=>{for(t=e.target,r("-document",e.type,e);t&&t.getAttribute;)c(t,"",e.type,e),t=e.bubbles?t.parentElement:null},d=e=>{e.target,r("-window",e.type,e)},u=e=>{if(e=t.readyState,!n&&("interactive"==e||"complete"==e)&&(n=1,r("","qinit",new CustomEvent("qinit")),"undefined"!=typeof IntersectionObserver)){const e=new IntersectionObserver((t=>{for(const n of t)n.isIntersecting&&(e.unobserve(n.target),c(n.target,"","qvisible",new CustomEvent("qvisible",{bubbles:!1,detail:n})))}));t.qO=e,t.querySelectorAll("[on\\\\:qvisible]").forEach((t=>e.observe(t)))}};t.qR||(t.qR=1,window.qEvents.forEach((e=>{document.addEventListener(e,b,{capture:!0}),window.addEventListener(e,d)})),t.addEventListener("readystatechange",u),u())})(document)})();';
var QWIK_LOADER_OPTIMIZE_DEBUG = '(() => {\n    function findModule(module) {\n        return Object.values(module).find(isModule) || module;\n    }\n    function isModule(module) {\n        return "object" == typeof module && module && "Module" === module[Symbol.toStringTag];\n    }\n    ((doc, hasInitialized, prefetchWorker) => {\n        const broadcast = (infix, type, ev) => {\n            type = type.replace(/([A-Z])/g, (a => "-" + a.toLowerCase()));\n            doc.querySelectorAll("[on" + infix + "\\\\:" + type + "]").forEach((target => dispatch(target, infix, type, ev)));\n        };\n        const emitEvent = (el, eventName, detail) => el.dispatchEvent(new CustomEvent(eventName, {\n            detail: detail,\n            bubbles: !0,\n            composed: !0\n        }));\n        const error = msg => {\n            throw new Error("QWIK " + msg);\n        };\n        const qrlResolver = (element, qrl) => {\n            element = element.closest("[q\\\\:container]");\n            return new URL(qrl, new URL(element ? element.getAttribute("q:base") : doc.baseURI, doc.baseURI));\n        };\n        const dispatch = async (element, onPrefix, eventName, ev) => {\n            element.hasAttribute("preventdefault:" + eventName) && ev.preventDefault();\n            const attrValue = element.getAttribute("on" + onPrefix + ":" + eventName);\n            if (attrValue) {\n                for (const qrl of attrValue.split("\\n")) {\n                    const url = qrlResolver(element, qrl);\n                    if (url) {\n                        const symbolName = getSymbolName(url);\n                        const handler = (window[url.pathname] || findModule(await import(url.href.split("#")[0])))[symbolName] || error(url + " does not export " + symbolName);\n                        const previousCtx = doc.__q_context__;\n                        if (element.isConnected) {\n                            try {\n                                doc.__q_context__ = [ element, ev, url ];\n                                handler(ev, element, url);\n                            } finally {\n                                doc.__q_context__ = previousCtx;\n                                emitEvent(element, "qsymbol", symbolName);\n                            }\n                        }\n                    }\n                }\n            }\n        };\n        const getSymbolName = url => url.hash.replace(/^#?([^?[|]*).*$/, "$1") || "default";\n        const processDocumentEvent = (ev, element) => {\n            element = ev.target;\n            broadcast("-document", ev.type, ev);\n            while (element && element.getAttribute) {\n                dispatch(element, "", ev.type, ev);\n                element = ev.bubbles ? element.parentElement : null;\n            }\n        };\n        const processWindowEvent = (ev, element) => {\n            ev.target;\n            broadcast("-window", ev.type, ev);\n        };\n        const processReadyStateChange = readyState => {\n            readyState = doc.readyState;\n            if (!hasInitialized && ("interactive" == readyState || "complete" == readyState)) {\n                hasInitialized = 1;\n                broadcast("", "qinit", new CustomEvent("qinit"));\n                if ("undefined" != typeof IntersectionObserver) {\n                    const observer = new IntersectionObserver((entries => {\n                        for (const entry of entries) {\n                            if (entry.isIntersecting) {\n                                observer.unobserve(entry.target);\n                                dispatch(entry.target, "", "qvisible", new CustomEvent("qvisible", {\n                                    bubbles: !1,\n                                    detail: entry\n                                }));\n                            }\n                        }\n                    }));\n                    doc.qO = observer;\n                    doc.querySelectorAll("[on\\\\:qvisible]").forEach((el => observer.observe(el)));\n                }\n            }\n        };\n        const addDocEventListener = eventName => {\n            document.addEventListener(eventName, processDocumentEvent, {\n                capture: !0\n            });\n            window.addEventListener(eventName, processWindowEvent);\n        };\n        if (!doc.qR) {\n            doc.qR = 1;\n            window.qEvents.forEach(addDocEventListener);\n            doc.addEventListener("readystatechange", processReadyStateChange);\n            processReadyStateChange();\n        }\n    })(document);\n})();';
function getQwikLoaderScript(opts = {}) {
  if (Array.isArray(opts.events) && opts.events.length > 0) {
    const loader = opts.debug ? QWIK_LOADER_OPTIMIZE_DEBUG : QWIK_LOADER_OPTIMIZE_MINIFIED;
    return loader.replace("window.qEvents", JSON.stringify(opts.events));
  }
  return opts.debug ? QWIK_LOADER_DEFAULT_DEBUG : QWIK_LOADER_DEFAULT_MINIFIED;
}
function workerFetchScript() {
  const fetch = `Promise.all(e.data.map(u=>fetch(u))).finally(()=>{setTimeout(postMessage({}),9999)})`;
  const workerBody = `onmessage=(e)=>{${fetch}}`;
  const blob = `new Blob(['${workerBody}'],{type:"text/javascript"})`;
  const url = `URL.createObjectURL(${blob})`;
  let s = `const w=new Worker(${url});`;
  s += `w.postMessage(u.map(u=>new URL(u,origin)+''));`;
  s += `w.onmessage=()=>{w.terminate()};`;
  return s;
}
function prefetchUrlsEventScript(prefetchResources) {
  const data = {
    urls: flattenPrefetchResources(prefetchResources)
  };
  return `dispatchEvent(new CustomEvent("qprefetch",{detail:${JSON.stringify(data)}}))`;
}
function flattenPrefetchResources(prefetchResources) {
  const urls = [];
  const addPrefetchResource = (prefetchResources2) => {
    if (Array.isArray(prefetchResources2)) {
      for (const prefetchResource of prefetchResources2) {
        if (!urls.includes(prefetchResource.url)) {
          urls.push(prefetchResource.url);
          addPrefetchResource(prefetchResource.imports);
        }
      }
    }
  };
  addPrefetchResource(prefetchResources);
  return urls;
}
function applyPrefetchImplementation(opts, prefetchResources) {
  const { prefetchStrategy } = opts;
  if (prefetchStrategy !== null) {
    const prefetchImpl = normalizePrefetchImplementation(prefetchStrategy == null ? void 0 : prefetchStrategy.implementation);
    const prefetchNodes = [];
    if (prefetchImpl.prefetchEvent === "always") {
      prefetchUrlsEvent(prefetchNodes, prefetchResources);
    }
    if (prefetchImpl.linkInsert === "html-append") {
      linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl);
    }
    if (prefetchImpl.linkInsert === "js-append") {
      linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl);
    } else if (prefetchImpl.workerFetchInsert === "always") {
      workerFetchImplementation(prefetchNodes, prefetchResources);
    }
    if (prefetchNodes.length > 0) {
      return jsx(Fragment, { children: prefetchNodes });
    }
  }
  return null;
}
function prefetchUrlsEvent(prefetchNodes, prefetchResources) {
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: prefetchUrlsEventScript(prefetchResources)
    })
  );
}
function linkHtmlImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const urls = flattenPrefetchResources(prefetchResources);
  const rel = prefetchImpl.linkRel || "prefetch";
  for (const url of urls) {
    const attributes = {};
    attributes["href"] = url;
    attributes["rel"] = rel;
    if (rel === "prefetch" || rel === "preload") {
      if (url.endsWith(".js")) {
        attributes["as"] = "script";
      }
    }
    prefetchNodes.push(jsx("link", attributes, void 0));
  }
}
function linkJsImplementation(prefetchNodes, prefetchResources, prefetchImpl) {
  const rel = prefetchImpl.linkRel || "prefetch";
  let s = ``;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `let supportsLinkRel = true;`;
  }
  s += `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += `u.map((u,i)=>{`;
  s += `const l=document.createElement('link');`;
  s += `l.setAttribute("href",u);`;
  s += `l.setAttribute("rel","${rel}");`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(i===0){`;
    s += `try{`;
    s += `supportsLinkRel=l.relList.supports("${rel}");`;
    s += `}catch(e){}`;
    s += `}`;
  }
  s += `document.body.appendChild(l);`;
  s += `});`;
  if (prefetchImpl.workerFetchInsert === "no-link-support") {
    s += `if(!supportsLinkRel){`;
    s += workerFetchScript();
    s += `}`;
  }
  if (prefetchImpl.workerFetchInsert === "always") {
    s += workerFetchScript();
  }
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: s
    })
  );
}
function workerFetchImplementation(prefetchNodes, prefetchResources) {
  let s = `const u=${JSON.stringify(flattenPrefetchResources(prefetchResources))};`;
  s += workerFetchScript();
  prefetchNodes.push(
    jsx("script", {
      type: "module",
      dangerouslySetInnerHTML: s
    })
  );
}
function normalizePrefetchImplementation(input) {
  if (typeof input === "string") {
    switch (input) {
      case "link-prefetch-html": {
        return {
          linkInsert: "html-append",
          linkRel: "prefetch",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-prefetch": {
        return {
          linkInsert: "js-append",
          linkRel: "prefetch",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
      case "link-preload-html": {
        return {
          linkInsert: "html-append",
          linkRel: "preload",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-preload": {
        return {
          linkInsert: "js-append",
          linkRel: "preload",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
      case "link-modulepreload-html": {
        return {
          linkInsert: "html-append",
          linkRel: "modulepreload",
          workerFetchInsert: null,
          prefetchEvent: null
        };
      }
      case "link-modulepreload": {
        return {
          linkInsert: "js-append",
          linkRel: "modulepreload",
          workerFetchInsert: "no-link-support",
          prefetchEvent: null
        };
      }
    }
    return {
      linkInsert: null,
      linkRel: null,
      workerFetchInsert: "always",
      prefetchEvent: null
    };
  }
  if (input && typeof input === "object") {
    return input;
  }
  const defaultImplementation = {
    linkInsert: null,
    linkRel: null,
    workerFetchInsert: "always",
    prefetchEvent: null
  };
  return defaultImplementation;
}
[
  "click",
  "dblclick",
  "contextmenu",
  "auxclick",
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerover",
  "pointerenter",
  "pointerleave",
  "pointerout",
  "pointercancel",
  "gotpointercapture",
  "lostpointercapture",
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
  "mousedown",
  "mouseup",
  "mousemove",
  "mouseenter",
  "mouseleave",
  "mouseover",
  "mouseout",
  "wheel",
  "gesturestart",
  "gesturechange",
  "gestureend",
  "keydown",
  "keyup",
  "keypress",
  "input",
  "change",
  "search",
  "invalid",
  "beforeinput",
  "select",
  "focusin",
  "focusout",
  "focus",
  "blur",
  "submit",
  "reset",
  "scroll"
].map((n) => `on${n.toLowerCase()}$`);
[
  "useWatch$",
  "useClientEffect$",
  "useEffect$",
  "component$",
  "useStyles$",
  "useStylesScoped$"
].map((n) => n.toLowerCase());
function getValidManifest(manifest2) {
  if (manifest2 != null && manifest2.mapping != null && typeof manifest2.mapping === "object" && manifest2.symbols != null && typeof manifest2.symbols === "object" && manifest2.bundles != null && typeof manifest2.bundles === "object") {
    return manifest2;
  }
  return void 0;
}
function getPrefetchResources(snapshotResult, opts, mapper) {
  const manifest2 = getValidManifest(opts.manifest);
  if (manifest2 && mapper) {
    const prefetchStrategy = opts.prefetchStrategy;
    const buildBase = getBuildBase(opts);
    if (prefetchStrategy !== null) {
      if (!prefetchStrategy || !prefetchStrategy.symbolsToPrefetch || prefetchStrategy.symbolsToPrefetch === "auto") {
        return getAutoPrefetch(snapshotResult, manifest2, mapper, buildBase);
      }
      if (typeof prefetchStrategy.symbolsToPrefetch === "function") {
        try {
          return prefetchStrategy.symbolsToPrefetch({ manifest: manifest2 });
        } catch (e) {
          console.error("getPrefetchUrls, symbolsToPrefetch()", e);
        }
      }
    }
  }
  return [];
}
function getAutoPrefetch(snapshotResult, manifest2, mapper, buildBase) {
  const prefetchResources = [];
  const listeners = snapshotResult == null ? void 0 : snapshotResult.listeners;
  const stateObjs = snapshotResult == null ? void 0 : snapshotResult.objs;
  const urls = /* @__PURE__ */ new Set();
  if (Array.isArray(listeners)) {
    for (const prioritizedSymbolName in mapper) {
      const hasSymbol = listeners.some((l) => {
        return l.qrl.getHash() === prioritizedSymbolName;
      });
      if (hasSymbol) {
        addBundle(manifest2, urls, prefetchResources, buildBase, mapper[prioritizedSymbolName][1]);
      }
    }
  }
  if (Array.isArray(stateObjs)) {
    for (const obj of stateObjs) {
      if (isQrl(obj)) {
        const qrlSymbolName = obj.getHash();
        const resolvedSymbol = mapper[qrlSymbolName];
        if (resolvedSymbol) {
          addBundle(manifest2, urls, prefetchResources, buildBase, resolvedSymbol[0]);
        }
      }
    }
  }
  return prefetchResources;
}
function addBundle(manifest2, urls, prefetchResources, buildBase, bundleFileName) {
  const url = buildBase + bundleFileName;
  if (!urls.has(url)) {
    urls.add(url);
    const bundle = manifest2.bundles[bundleFileName];
    if (bundle) {
      const prefetchResource = {
        url,
        imports: []
      };
      prefetchResources.push(prefetchResource);
      if (Array.isArray(bundle.imports)) {
        for (const importedFilename of bundle.imports) {
          addBundle(manifest2, urls, prefetchResource.imports, buildBase, importedFilename);
        }
      }
    }
  }
}
var isQrl = (value) => {
  return typeof value === "function" && typeof value.getSymbol === "function";
};
function createEl(tagName, doc) {
  return {
    nodeType: tagName === ":virtual" ? 111 : 1,
    nodeName: tagName.toUpperCase(),
    localName: tagName,
    ownerDocument: doc,
    isConnected: true,
    ["__ctx__"]: null,
    ["q:id"]: null
  };
}
function createSimpleDocument() {
  const doc = {
    nodeType: 9,
    parentElement: null,
    ownerDocument: null,
    createElement(tagName) {
      return createEl(tagName, doc);
    }
  };
  return doc;
}
var qDev = globalThis.qDev === true;
var DOCTYPE = "<!DOCTYPE html>";
async function renderToStream(rootNode, opts) {
  var _a2, _b, _c, _d, _e, _f, _g;
  let stream = opts.stream;
  let bufferSize = 0;
  let totalSize = 0;
  let networkFlushes = 0;
  let firstFlushTime = 0;
  const doc = createSimpleDocument();
  const inOrderStreaming = (_b = (_a2 = opts.streaming) == null ? void 0 : _a2.inOrder) != null ? _b : {
    strategy: "auto",
    initialChunkSize: 3e4,
    minimunChunkSize: 1024
  };
  const containerTagName = (_c = opts.containerTagName) != null ? _c : "html";
  const containerAttributes = (_d = opts.containerAttributes) != null ? _d : {};
  const buffer = [];
  const nativeStream = stream;
  const firstFlushTimer = createTimer();
  function flush() {
    buffer.forEach((chunk) => nativeStream.write(chunk));
    buffer.length = 0;
    bufferSize = 0;
    networkFlushes++;
    if (networkFlushes === 1) {
      firstFlushTime = firstFlushTimer();
    }
  }
  function enqueue(chunk) {
    bufferSize += chunk.length;
    totalSize += chunk.length;
    buffer.push(chunk);
  }
  switch (inOrderStreaming.strategy) {
    case "disabled":
      stream = {
        write: enqueue
      };
      break;
    case "auto":
      let count = 0;
      const minimunChunkSize = (_e = inOrderStreaming.minimunChunkSize) != null ? _e : 0;
      const initialChunkSize = (_f = inOrderStreaming.initialChunkSize) != null ? _f : 0;
      stream = {
        write(chunk) {
          enqueue(chunk);
          if (chunk === "<!--qkssr-pu-->") {
            count++;
          } else if (count > 0 && chunk === "<!--qkssr-po-->") {
            count--;
          }
          const chunkSize = networkFlushes === 0 ? initialChunkSize : minimunChunkSize;
          if (count === 0 && bufferSize >= chunkSize) {
            flush();
          }
        }
      };
      break;
  }
  if (containerTagName === "html") {
    stream.write(DOCTYPE);
  } else {
    if (opts.qwikLoader) {
      if (opts.qwikLoader.include === void 0) {
        opts.qwikLoader.include = "never";
      }
      if (opts.qwikLoader.position === void 0) {
        opts.qwikLoader.position = "bottom";
      }
    } else {
      opts.qwikLoader = {
        include: "never"
      };
    }
  }
  if (!opts.manifest) {
    console.warn("Missing client manifest, loading symbols in the client might 404");
  }
  const buildBase = getBuildBase(opts);
  const mapper = computeSymbolMapper(opts.manifest);
  await setServerPlatform(doc, opts, mapper);
  let prefetchResources = [];
  let snapshotResult = null;
  const injections = (_g = opts.manifest) == null ? void 0 : _g.injections;
  const beforeContent = injections ? injections.map((injection) => jsx(injection.tag, injection.attributes)) : void 0;
  const renderTimer = createTimer();
  let renderTime = 0;
  let snapshotTime = 0;
  await renderSSR(doc, rootNode, {
    stream,
    containerTagName,
    containerAttributes,
    envData: opts.envData,
    base: buildBase,
    beforeContent,
    beforeClose: async (contexts, containerState) => {
      var _a3, _b2, _c2;
      renderTime = renderTimer();
      const snapshotTimer = createTimer();
      snapshotResult = await _pauseFromContexts(contexts, containerState);
      prefetchResources = getPrefetchResources(snapshotResult, opts, mapper);
      const jsonData = JSON.stringify(snapshotResult.state, void 0, qDev ? "  " : void 0);
      const children = [
        jsx("script", {
          type: "qwik/json",
          dangerouslySetInnerHTML: escapeText(jsonData)
        })
      ];
      if (prefetchResources.length > 0) {
        children.push(applyPrefetchImplementation(opts, prefetchResources));
      }
      const needLoader = !snapshotResult || snapshotResult.mode !== "static";
      const includeMode = (_b2 = (_a3 = opts.qwikLoader) == null ? void 0 : _a3.include) != null ? _b2 : "auto";
      const includeLoader = includeMode === "always" || includeMode === "auto" && needLoader;
      if (includeLoader) {
        const qwikLoaderScript = getQwikLoaderScript({
          events: (_c2 = opts.qwikLoader) == null ? void 0 : _c2.events,
          debug: opts.debug
        });
        children.push(
          jsx("script", {
            id: "qwikloader",
            dangerouslySetInnerHTML: qwikLoaderScript
          })
        );
      }
      snapshotTime = snapshotTimer();
      return jsx(Fragment, { children });
    }
  });
  flush();
  const result = {
    prefetchResources,
    snapshotResult,
    flushes: networkFlushes,
    size: totalSize,
    timing: {
      render: renderTime,
      snapshot: snapshotTime,
      firstFlush: firstFlushTime
    }
  };
  return result;
}
function computeSymbolMapper(manifest2) {
  if (manifest2) {
    const mapper = {};
    Object.entries(manifest2.mapping).forEach(([key, value]) => {
      mapper[getSymbolHash(key)] = [key, value];
    });
    return mapper;
  }
  return void 0;
}
var escapeText = (str) => {
  return str.replace(/<(\/?script)/g, "\\x3C$1");
};
const manifest = { "symbols": { "s_hA9UPaY8sNQ": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_a_onClick", "canonicalFilename": "s_ha9upay8snq", "hash": "hA9UPaY8sNQ", "ctxKind": "event", "ctxName": "onClick$", "captures": true, "parent": "s_mYsiJcA4IBc" }, "s_skxgNVWVOT8": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component_a_onMouseOver", "canonicalFilename": "s_skxgnvwvot8", "hash": "skxgNVWVOT8", "ctxKind": "event", "ctxName": "onMouseOver$", "captures": true, "parent": "s_mYsiJcA4IBc" }, "s_GVTwofbNpXY": { "origin": "components/input/index.tsx", "displayName": "input_component_div_div_input_onKeyUp", "canonicalFilename": "s_gvtwofbnpxy", "hash": "GVTwofbNpXY", "ctxKind": "event", "ctxName": "onKeyUp$", "captures": true, "parent": "s_GnNtBN4M78Y" }, "s_AaAlzKH0KlQ": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCity_component_useWatch", "canonicalFilename": "s_aaalzkh0klq", "hash": "AaAlzKH0KlQ", "ctxKind": "function", "ctxName": "useWatch$", "captures": true, "parent": "s_z1nvHyEppoI" }, "s_wPm7wIpkK5M": { "origin": "components/input/index.tsx", "displayName": "input_component_useWatch", "canonicalFilename": "s_wpm7wipkk5m", "hash": "wPm7wIpkK5M", "ctxKind": "function", "ctxName": "useWatch$", "captures": true, "parent": "s_GnNtBN4M78Y" }, "s_26e99OMlrIo": { "origin": "routes/[id]/index.tsx", "displayName": "_id__component", "canonicalFilename": "s_26e99omlrio", "hash": "26e99OMlrIo", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_4O3E9b0Gb3E": { "origin": "components/head/head.tsx", "displayName": "Head_component", "canonicalFilename": "s_4o3e9b0gb3e", "hash": "4O3E9b0Gb3E", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_71FULP5QgZ0": { "origin": "root.tsx", "displayName": "root_component", "canonicalFilename": "s_71fulp5qgz0", "hash": "71FULP5QgZ0", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_GnNtBN4M78Y": { "origin": "components/input/index.tsx", "displayName": "input_component", "canonicalFilename": "s_gnntbn4m78y", "hash": "GnNtBN4M78Y", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_MMlwgAZyTrI": { "origin": "components/logo/logo.tsx", "displayName": "logo_component", "canonicalFilename": "s_mmlwgazytri", "hash": "MMlwgAZyTrI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_WikAbh1oHUE": { "origin": "components/card/card.tsx", "displayName": "Card_component", "canonicalFilename": "s_wikabh1ohue", "hash": "WikAbh1oHUE", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_XcCidBDjMKc": { "origin": "routes/index.tsx", "displayName": "routes_component", "canonicalFilename": "s_xccidbdjmkc", "hash": "XcCidBDjMKc", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_eax3X8Kisbg": { "origin": "components/menu/index.tsx", "displayName": "menu_component", "canonicalFilename": "s_eax3x8kisbg", "hash": "eax3X8Kisbg", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_mYsiJcA4IBc": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "Link_component", "canonicalFilename": "s_mysijca4ibc", "hash": "mYsiJcA4IBc", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_nd8yk3KO22c": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "RouterOutlet_component", "canonicalFilename": "s_nd8yk3ko22c", "hash": "nd8yk3KO22c", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_vRVzuC5Gxqo": { "origin": "routes/layout.tsx", "displayName": "layout_component", "canonicalFilename": "s_vrvzuc5gxqo", "hash": "vRVzuC5Gxqo", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_yUNMrT5gcJo": { "origin": "components/section-card/index.tsx", "displayName": "section_card_component", "canonicalFilename": "s_yunmrt5gcjo", "hash": "yUNMrT5gcJo", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_z1nvHyEppoI": { "origin": "../node_modules/@builder.io/qwik-city/index.qwik.mjs", "displayName": "QwikCity_component", "canonicalFilename": "s_z1nvhyeppoi", "hash": "z1nvHyEppoI", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_zimz5K0iZa0": { "origin": "components/header/index.tsx", "displayName": "header_component", "canonicalFilename": "s_zimz5k0iza0", "hash": "zimz5K0iZa0", "ctxKind": "function", "ctxName": "component$", "captures": false, "parent": null }, "s_9fGGljw2NZ0": { "origin": "components/menu/index.tsx", "displayName": "menu_component_useStyles", "canonicalFilename": "s_9fggljw2nz0", "hash": "9fGGljw2NZ0", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_eax3X8Kisbg" }, "s_QIaZq0BOeZE": { "origin": "components/header/index.tsx", "displayName": "header_component_useStyles", "canonicalFilename": "s_qiazq0boeze", "hash": "QIaZq0BOeZE", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_zimz5K0iZa0" }, "s_a9EwQzq9TnE": { "origin": "components/input/index.tsx", "displayName": "input_component_useStyles", "canonicalFilename": "s_a9ewqzq9tne", "hash": "a9EwQzq9TnE", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_GnNtBN4M78Y" }, "s_cg4M6jCbWew": { "origin": "components/logo/logo.tsx", "displayName": "logo_component_useStyles", "canonicalFilename": "s_cg4m6jcbwew", "hash": "cg4M6jCbWew", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_MMlwgAZyTrI" }, "s_ciAKlQfMg20": { "origin": "root.tsx", "displayName": "root_component_useStyles", "canonicalFilename": "s_ciaklqfmg20", "hash": "ciAKlQfMg20", "ctxKind": "function", "ctxName": "useStyles$", "captures": false, "parent": "s_71FULP5QgZ0" }, "s_6oGzOvC7MqU": { "origin": "components/card/card.tsx", "displayName": "Card_component_useStylesScoped", "canonicalFilename": "s_6ogzovc7mqu", "hash": "6oGzOvC7MqU", "ctxKind": "function", "ctxName": "useStylesScoped$", "captures": false, "parent": "s_WikAbh1oHUE" }, "s_sZNRTqxzwxw": { "origin": "components/section-card/index.tsx", "displayName": "section_card_component_useStylesScoped", "canonicalFilename": "s_sznrtqxzwxw", "hash": "sZNRTqxzwxw", "ctxKind": "function", "ctxName": "useStylesScoped$", "captures": false, "parent": "s_yUNMrT5gcJo" } }, "mapping": { "s_hA9UPaY8sNQ": "q-458caa17.js", "s_skxgNVWVOT8": "q-458caa17.js", "s_GVTwofbNpXY": "q-31b299d0.js", "s_AaAlzKH0KlQ": "q-1d0f62a4.js", "s_wPm7wIpkK5M": "q-31b299d0.js", "s_26e99OMlrIo": "q-9d32fc6e.js", "s_4O3E9b0Gb3E": "q-ff49253a.js", "s_71FULP5QgZ0": "q-cec87d7b.js", "s_GnNtBN4M78Y": "q-31b299d0.js", "s_MMlwgAZyTrI": "q-c894cb68.js", "s_WikAbh1oHUE": "q-257d9bb2.js", "s_XcCidBDjMKc": "q-857086b3.js", "s_eax3X8Kisbg": "q-4ccb301b.js", "s_mYsiJcA4IBc": "q-458caa17.js", "s_nd8yk3KO22c": "q-9618d83c.js", "s_vRVzuC5Gxqo": "q-0e0c7efe.js", "s_yUNMrT5gcJo": "q-9a2881e2.js", "s_z1nvHyEppoI": "q-1d0f62a4.js", "s_zimz5K0iZa0": "q-699b1375.js", "s_9fGGljw2NZ0": "q-4ccb301b.js", "s_QIaZq0BOeZE": "q-699b1375.js", "s_a9EwQzq9TnE": "q-31b299d0.js", "s_cg4M6jCbWew": "q-c894cb68.js", "s_ciAKlQfMg20": "q-cec87d7b.js", "s_6oGzOvC7MqU": "q-257d9bb2.js", "s_sZNRTqxzwxw": "q-9a2881e2.js" }, "bundles": { "q-0e0c7efe.js": { "size": 111, "symbols": ["s_vRVzuC5Gxqo"], "imports": ["q-8049feb9.js"] }, "q-1d0f62a4.js": { "size": 1472, "symbols": ["s_AaAlzKH0KlQ", "s_z1nvHyEppoI"], "imports": ["q-8049feb9.js", "q-cec87d7b.js"], "dynamicImports": ["q-a25ab838.js"] }, "q-257d9bb2.js": { "size": 557, "symbols": ["s_6oGzOvC7MqU", "s_WikAbh1oHUE"], "imports": ["q-8049feb9.js", "q-bab98f49.js"] }, "q-31b299d0.js": { "size": 3594, "symbols": ["s_a9EwQzq9TnE", "s_GnNtBN4M78Y", "s_GVTwofbNpXY", "s_wPm7wIpkK5M"], "imports": ["q-8049feb9.js", "q-857086b3.js"] }, "q-458caa17.js": { "size": 785, "symbols": ["s_hA9UPaY8sNQ", "s_mYsiJcA4IBc", "s_skxgNVWVOT8"], "imports": ["q-8049feb9.js", "q-cec87d7b.js"] }, "q-4ccb301b.js": { "size": 926, "symbols": ["s_9fGGljw2NZ0", "s_eax3X8Kisbg"], "imports": ["q-8049feb9.js"] }, "q-55c2faa3.js": { "size": 58, "symbols": [], "imports": ["q-8049feb9.js"] }, "q-699b1375.js": { "size": 1026, "symbols": ["s_QIaZq0BOeZE", "s_zimz5K0iZa0"], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-4ccb301b.js", "q-c894cb68.js"] }, "q-8049feb9.js": { "size": 38230, "symbols": [], "dynamicImports": ["q-cec87d7b.js"] }, "q-857086b3.js": { "size": 1978, "symbols": ["s_XcCidBDjMKc"], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-31b299d0.js", "q-9a2881e2.js"] }, "q-9618d83c.js": { "size": 288, "symbols": ["s_nd8yk3KO22c"], "imports": ["q-8049feb9.js", "q-cec87d7b.js"] }, "q-9a2881e2.js": { "size": 786, "symbols": ["s_sZNRTqxzwxw", "s_yUNMrT5gcJo"], "imports": ["q-8049feb9.js", "q-857086b3.js", "q-bab98f49.js"] }, "q-9d32fc6e.js": { "size": 502, "symbols": ["s_26e99OMlrIo"], "imports": ["q-8049feb9.js", "q-bab98f49.js", "q-cec87d7b.js"] }, "q-a25ab838.js": { "size": 368, "symbols": [], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-a437ebd2.js", "q-a6a3382a.js", "q-edf009f3.js"] }, "q-a437ebd2.js": { "size": 171, "symbols": [], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-857086b3.js"] }, "q-a6a3382a.js": { "size": 158, "symbols": [], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-0e0c7efe.js"] }, "q-bab98f49.js": { "size": 602, "symbols": [], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-257d9bb2.js"] }, "q-c894cb68.js": { "size": 428, "symbols": ["s_cg4M6jCbWew", "s_MMlwgAZyTrI"], "imports": ["q-699b1375.js", "q-8049feb9.js"] }, "q-cec87d7b.js": { "size": 3350, "symbols": ["s_71FULP5QgZ0", "s_ciAKlQfMg20"], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-1d0f62a4.js", "q-458caa17.js", "q-699b1375.js", "q-9618d83c.js", "q-ff49253a.js"] }, "q-edf009f3.js": { "size": 158, "symbols": [], "imports": ["q-8049feb9.js"], "dynamicImports": ["q-9d32fc6e.js"] }, "q-ff49253a.js": { "size": 1005, "symbols": ["s_4O3E9b0Gb3E"], "imports": ["q-8049feb9.js", "q-cec87d7b.js"] } }, "injections": [{ "tag": "link", "location": "head", "attributes": { "rel": "stylesheet", "href": "/build/q-53fcfa52.css" } }], "version": "1", "options": { "target": "client", "buildMode": "production", "forceFullBuild": true, "entryStrategy": { "type": "smart" } }, "platform": { "qwik": "0.0.107", "vite": "", "rollup": "2.77.3", "env": "node", "os": "win32", "node": "16.15.1" } };
const Social = () => {
  return /* @__PURE__ */ jsx(Fragment, {
    children: [
      /* @__PURE__ */ jsx("meta", {
        property: "og:site_name",
        content: "Qwik"
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:card",
        content: "summary_large_image"
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:site",
        content: "@QwikDev"
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "twitter:title",
        content: "Qwik"
      })
    ]
  });
};
const Head = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  return /* @__PURE__ */ jsx("head", {
    children: [
      /* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }),
      /* @__PURE__ */ jsx("title", {
        children: head.title ? `${head.title} - Qwik` : `Qwik`
      }),
      /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0"
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "canonical",
        href: loc.href
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.googleapis.com"
      }),
      /* @__PURE__ */ jsx("link", {
        rel: "preconnect",
        href: "https://fonts.gstatic.com"
      }),
      /* @__PURE__ */ jsx("link", {
        href: "https://fonts.googleapis.com/css2?family=Poppins:wght@200;300;400;500&display=swap",
        rel: "stylesheet"
      }),
      head.meta.map((m) => /* @__PURE__ */ jsx("meta", {
        ...m
      })),
      head.links.map((l) => /* @__PURE__ */ jsx("link", {
        ...l
      })),
      head.styles.map((s) => /* @__PURE__ */ jsx("style", {
        ...s.props,
        dangerouslySetInnerHTML: s.style
      })),
      /* @__PURE__ */ jsx(Social, {})
    ]
  });
}, "s_4O3E9b0Gb3E"));
const Logo = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(logoStyle, "s_cg4M6jCbWew"));
  return /* @__PURE__ */ jsx("div", {
    className: "logo",
    children: /* @__PURE__ */ jsx("span", {
      children: "LM"
    })
  });
}, "s_MMlwgAZyTrI"));
const logoStyle = `
  .logo{
    width:50px;
    height:50px;
    background-color:#F7DF1E;
    border-radius: 10px;
    display: flex;
    align-items: end;
    justify-content: end;
  }

  .logo span{
    font-weight: 600;
    margin: 0 5px;
    font-size: 1.25rem;
  }
`;
const Menu = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(menuStyle, "s_9fGGljw2NZ0"));
  const state = useStore({
    item: [
      {
        name: "T\xE9cnologia",
        link: "/vectores"
      },
      {
        name: "Programaci\xF3n",
        link: "/photos"
      },
      {
        name: "Qwik",
        link: "/psd"
      },
      {
        name: "Angular",
        link: "/video"
      },
      {
        name: "React",
        link: "/video"
      },
      {
        name: "Node",
        link: "/video"
      }
    ]
  });
  return /* @__PURE__ */ jsx("div", {
    className: "menu",
    children: /* @__PURE__ */ jsx("ul", {
      children: state.item.map((menu) => /* @__PURE__ */ jsx("li", {
        children: menu.name
      }))
    })
  });
}, "s_eax3X8Kisbg"));
const menuStyle = `
    .menu ul{
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        gap: 2rem;
    }

    .menu ul li{
        color:var(--color-2)
    }
`;
const Header = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(headerStyle, "s_QIaZq0BOeZE"));
  return /* @__PURE__ */ jsx("div", {
    className: "header",
    children: [
      /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx(Logo, {})
      }),
      /* @__PURE__ */ jsx("div", {
        children: /* @__PURE__ */ jsx(Menu, {})
      })
    ]
  });
}, "s_zimz5K0iZa0"));
const headerStyle = `
  .header {
    font-weight:500;
    display: flex;
    gap: 3rem;
    padding: 1rem 5rem;
    align-items:center
`;
const style = "/**\n * Write here your global css styles\n */\n:root {\n    --color-1: #F5F6F6;\n    --color-2: #666767;\n    --color-3: #979797;\n    --font-family: 'Poppins', sans-serif;\n}\n\na {\n    color: #1a1a1a;\n    text-decoration: none;\n}\n\nhtml, body {\n    margin: 0;\n    padding: 0;\n    font-weight: 400;\n    background-color: var(--color-1);\n    font-family: var(--font-family);\n}\n\ninput, button {\n    font-family: var(--font-family);\n}";
const Root = /* @__PURE__ */ componentQrl(inlinedQrl(() => {
  useStylesQrl(inlinedQrl(style, "s_ciAKlQfMg20"));
  return /* @__PURE__ */ jsx(QwikCity, {
    children: [
      /* @__PURE__ */ jsx(Head, {}),
      /* @__PURE__ */ jsx("body", {
        lang: "en",
        children: [
          /* @__PURE__ */ jsx(Header, {}),
          /* @__PURE__ */ jsx(RouterOutlet, {})
        ]
      })
    ]
  });
}, "s_71FULP5QgZ0"));
function render(opts) {
  return renderToStream(/* @__PURE__ */ jsx(Root, {}), {
    manifest,
    ...opts
  });
}
const qwikCityHandler = qwikCity(render);
export {
  qwikCityHandler as default
};

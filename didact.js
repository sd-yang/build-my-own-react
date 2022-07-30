const Didact = {
    createElement,
    render,
};

const isEvent = key => key.startsWith("on");
const isProperty = key =>
    key !== "children" && !isEvent(key);
const isNew = (prev, next) => key =>
    prev[key] !== next[key];
const isGone = (prev, next) => key => !(key in next);

function createDom(fiber) {
    const dom = element.type === 'TEXT_ELEMENT' ?
        document.createTextNode("") :
        document.createElement(element.type);
    Object.keys(element.type).filter(isProperty).forEach(name => {
        dom[name] = element.props[name];
    });
    return dom;
}

function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element]
        },
        alternate: currentRoot
    }
    deletions = [];
    nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

function commitRoot() {
    deletions.forEach(commitWork);
    commitWork(wipRoot.child);
    currentRoot = wipRoot;
    wipRoot = null;
}

function updateDom(dom, prevProps, nextProps) {
    //Remove old or changed event listeners
    Object.keys(prevProps)
        .filter(isEvent)
        .filter(
            key =>
                !(key in nextProps) ||
                isNew(prevProps, nextProps)(key)
        )
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.removeEventListener(
                eventType,
                prevProps[name]
            )
        })
    // Remove old properties
    Object.keys(prevProps)
        .filter(isProperty)
        .filter(isGone(prevProps, nextProps))
        .forEach(name => {
            dom[name] = ""
        })

    // Set new or changed properties
    Object.keys(nextProps)
        .filter(isProperty)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            dom[name] = nextProps[name]
        })

    // Add event listeners
    Object.keys(nextProps)
        .filter(isEvent)
        .filter(isNew(prevProps, nextProps))
        .forEach(name => {
            const eventType = name
                .toLowerCase()
                .substring(2)
            dom.addEventListener(
                eventType,
                nextProps[name]
            )
        })
}

function commitWork(fiber) {
    if (!fiber) return;
    const domParent = fiber.parent.dom;
    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)
    } else if (fiber.effectTag === "DELETION") {
        domParent.removeChild(fiber.dom)
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    }
    commitWork(fiber.child);
    commitWork(fiber.sibling);
}

// 控制 浏览器是否要渲染
function workLoop(deadline) {
    let shouldYield = false;
    // 循环渲染任务单元，同时返回下一个任务单元
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
        shouldYield = deadline.timeRemaining() < 1;
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot();
    }

    requestIdleCallback(workLoop);
}
// fiber要做的事
// 1. 把 element 添加到 DOM 行 2. 为该 fiber 节点的子节点新建 fiber 3. 挑选出下一个任务单元
// 每个 fiber 都会指向他的第一个子节点、下一个兄弟节点和父节点
// 当我们处理完一个fiber节点之后，child fiber 节点会作为下一个任务单元，没有就选择 兄弟节点


function performUnitOfWork(fiber) {
    // TODO add dom node
    // TODO create new fibers
    // TODO return next unit of word
    if (!fiber.dom) {
        fiber.dom = createDom(fiber);
    }

    const elements = fiber.props.children;
    reconcileChildren(fiber, elements);


    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        }
        nextFiber = nextFiber.parent;
    }
}

// 调和旧的 fiber 节点和新的react elements
function reconcileChildren(wipFiber, elements) {
    let index = 0;
    let oldFiber =
        wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling = null;

    while (index < elements.length || oldFiber != null) {
        const element = elements[index];
        const newFiber = null;

        // TODO compare oldFiber to element
        const sameType =
            oldFiber && element && element.type === oldFiber.type;

        if (sameType) {
            // TODO update the node
            newFiber = {
                type: oldFiber.type,
                props: element.props,
                dom: oldFiber.dom,
                parent: wipFiber,
                alternate: oldFiber,
                effectTag: "UPDATE",
            }
        }
        if (element && !sameType) {
            // TODO add this node
            newFiber = {
                type: element.type,
                props: element.props,
                dom: null,
                parent: wipFiber,
                alternate: null,
                effectTag: "PLACEMENT",
            }
        }
        if (oldFiber && !sameType) {
            // TODO delete the oldFiber's node
            oldFiber.effectTag = "DELETION"
            deletions.push(oldFiber)
        }

        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }

        // 判断是否事第一个子节点 设置父节点的child属性的指向
        if (index === 0) {
            wipFiber.child = newFiber;
            fiber.child = newFiber;
        } else {
            prevSibling.sibling = newFiber;
        }

        prevSibling = newFiber;
        index++;
    }
}

function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children
        }
    }
}

function createTextElement(text) {
    return {
        type: 'TEXT_ELEMENT',
        props: {
            nodeValue: text,
            children: []
        }
    }
}

export default Didact;

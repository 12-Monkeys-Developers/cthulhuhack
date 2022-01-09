
export class HandleDragApplication {
  
  constructor(getDocElement, options) {
    this.getDocElement = getDocElement
    this.initial = options.initial ?? { left: 200, top: 200 };
    this.maxPos = options.maxPos ?? { left: 200, top: 100 };
    this.minPos = options.minPos ?? { left: 2, top: 2 };
    this.settings = options.settings;

    game.settings.register(this.settings.system, this.settings.keyPosition, {
      scope: "client",
      config: false,
      default: this.initial,
      type: Object
    });
    this.position = game.settings.get(this.settings.system, this.settings.keyPosition);
    this._initDrag();
  }

  _initDrag() {
    this.drag = {
      topPos: 0, leftPos: 0,
      topEvent: 0, leftEvent: 0,
    }
  }

  _savePosition(newPosition) {
    this.position = newPosition;
    game.settings.set(this.settings.system, this.settings.keyPosition, this.position);
  }

  onMouseDown(event) {
    if (this.isRightMouseButton(event)) {
      this.handleMoveRightClick();
    }
    else {
      this.handleMoveDrag(event);
    }
  }

  isRightMouseButton(event) {
    event = event || window.event;
    if ("which" in event) { // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
      return event.which == 3;
    } else if ("button" in event) { // IE, Opera 
      return event.button == 2;
    }
    return false;
  }

  handleMoveRightClick(event) {
    event.preventDefault();
    this._savePosition(this.initial);
  }
  
  handleMoveDrag(event) {
    event.preventDefault();
    this._initDrag();
    this._dragElement(this.getDocElement(document));
  }

  _dragElement(element) {
    element.onmousedown = e => this._dragMouseDown(element, e);
  }

  _dragMouseDown(element, e) {
    e = e || window.event;
    e.preventDefault();
    this.drag.leftEvent = e.clientX;
    this.drag.topEvent = e.clientY;
    document.onmouseup = e => this._closeDragElement(element, e);
    document.onmousemove = e => this._elementDrag(element, e);
  }

  _elementDrag(element, e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    this.drag.leftPos = this.drag.leftEvent - e.clientX;
    this.drag.topPos = this.drag.topEvent - e.clientY;
    this.drag.leftEvent = e.clientX;
    this.drag.topEvent = e.clientY;

    // set the element's new position:
    this._setPositionStyle(element, {
      top: element.offsetTop - this.drag.topPos,
      left: element.offsetLeft - this.drag.leftPos
    });
  }

  _closeDragElement(element, e) {
    // stop moving when mouse button is released:
    element.onmousedown = null;
    document.onmouseup = null;
    document.onmousemove = null;

    const newPosition = {
      top: element.offsetTop - this.drag.topPos,
      left: element.offsetLeft - this.drag.leftPos
    };
    let newElementPos = this._constrain(newPosition);

    if (newElementPos.left != this.drag.leftPos
      || newElementPos.top != this.drag.topPos) {
      this._setPositionStyle(element, newElementPos);
    }
    this._savePosition(newElementPos);
  }

  setPosition(newPosition) {
    newPosition = newPosition ?? this.position;
    let application = this;
    return new Promise(resolve => {
      // TODO: can be made into class method
      function check() {
        let element = application.getDocElement(document);
        if (element) {
          application._setPositionStyle(element, application._constrain(newPosition));
          resolve();
        } else {
          setTimeout(check, 30);
        }
      }
      check();
    });
  }

  _setPositionStyle(element, position) {
    element.style.bottom = undefined;
    element.style.top = position.top + "px";
    element.style.left = position.left + "px";
  }

  _constrain(newPosition) {
    return {
      left: Math.max(this.minPos.left, Math.min(window.innerWidth - this.maxPos.left, newPosition.left)),
      top: Math.max(this.minPos.top, Math.min(window.innerHeight - this.maxPos.top, newPosition.top))
    };
  }

}
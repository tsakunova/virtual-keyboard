class SpeechRecognizer {
    constructor(callback) {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;

        this.recognition.addEventListener('result', (e) => {
            var text = Array.from(e.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
            callback(text)
   
        })
        
        this.recognition.addEventListener('end', this.stop.bind(this));
    }

    stop() {
        this.recognition.stop();
    }

    start() {
        this.recognition.start();
    }
};

const Keyboard = {
    elements: {
        main: null,
        keysContainer: null,
        keys: []
    },

    eventHandlers: {
        oninput: null,
        onclose: null
    },

    properties: {
        value: '',
        capsLock: false,
        shift: false,
        isShift: false,
        isAudio: false,
        isMic: false,
        isFiz: false,
        lang: 'en'

    },
    prevVoice: '',

    keyLayouts: {
        en: [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace',
            'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']',
            'caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter',
            'mic', 'shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/',
            'audio', 'EN', 'space', 'left', 'right', 'done'
        ],
        shiftEn: [
            '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+', 'backspace',
            'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}',
            'caps', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '\"', 'enter',
            'mic', 'shift', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?',
            'audio', 'EN', 'space', 'left', 'right', 'done'
        ],
        ru: [
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'backspace',
            'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ',
            'caps', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'enter',
            'mic', 'shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', '.',
            'audio', 'RU', 'space', 'left', 'right', 'done'
        ],
        shiftRu: [
            '!', '\'', '№', ';', '%', ':', '?', '*', '(', ')', '_', '+', 'backspace',
            'й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ',
            'caps', 'ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', 'enter',
            'mic', 'shift', 'я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', ',',
            'audio', 'RU', 'space', 'left', 'right', 'done'
        ]
    },

    init() {
        document.querySelector('.container').innerHTML = '';
        // Create main elements
        this.elements.main = document.createElement('div');
        this.elements.keysContainer = document.createElement('div');

        // Setup main elements
        this.elements.main.classList.add('keyboard', 'keyboard--hidden');
        this.elements.keysContainer.classList.add('keyboard__keys');
        this.elements.keysContainer.appendChild(this._createKeys());

        this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');

        // Add to DOM
        this.elements.main.appendChild(this.elements.keysContainer);
        document.querySelector('.container').appendChild(this.elements.main);

        // Automatically use keyboard for elements with .use-keyboard-input
        document.querySelectorAll('.use-keyboard-input').forEach(element => {
            element.addEventListener('focus', () => {
                this.open(element.value, currentValue => {
                    element.value = currentValue;
                });
            });
        });
    },

    _drawKeyboard() {
        for (const key of this.elements.keys) {
            if (key.childElementCount === 0) {
                key.textContent = (!this.properties.capsLock && !this.properties.isShift) ||
                    (this.properties.capsLock && this.properties.isShift) ? key.textContent.toLowerCase() : key.textContent.toUpperCase();
            }
        }
    },

    _chooseLang() {
        if (this.properties.isShift && this.properties.lang === 'en') {
            return this.keyLayouts.shiftEn
        }
        if (!this.properties.isShift && this.properties.lang === 'en') {
            return this.keyLayouts.en
        }
        if (this.properties.isShift && this.properties.lang === 'ru') {
            return this.keyLayouts.shiftRu
        }
        if (!this.properties.isShift && this.properties.lang === 'ru') {
            return this.keyLayouts.ru
        }
    },

    _generateTextForPosition() {
        let cursorPos = this._getCursorPosition();
        const left = this.properties.value.slice(0, cursorPos);
        const right = this.properties.value.slice(cursorPos);
        return [cursorPos, left, right]
    },
    _createKeys() {
        const fragment = document.createDocumentFragment();

        // Creates HTML for an icon
        const createIconHTML = (icon_name) => {
            return `<i class='material-icons'>${icon_name}</i>`;
        };

        this._chooseLang().forEach(key => {
            const keyElement = document.createElement('button');
            if (this.properties.lang === 'en' || this.properties.lang === 'shiftEn') {
                insertLineBreak = ['backspace', ']', 'enter', '/', '}', '?'].indexOf(key) !== -1;
            }
            if (this.properties.lang === 'ru' || this.properties.lang === 'shiftRu') {
                insertLineBreak = ['backspace', 'ъ', 'enter', '.', ','].indexOf(key) !== -1;
            }




            // Add attributes/classes
            keyElement.setAttribute('type', 'button');
            keyElement.classList.add('keyboard__key');


            switch (key) {
                case 'backspace':

                    keyElement.classList.add('keyboard__key--wide', 'key_8');
                    keyElement.innerHTML = createIconHTML('backspace');

                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('space')
                        const textPos = this._generateTextForPosition();
                        this.properties.value = `${textPos[1].slice(0, -1)}${textPos[2]}`;
                        textPos[0] -= 1;
                        this._triggerEvent('oninput');
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
                    });

                    break;

                case 'caps':
                    keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable', 'key_20');
                    keyElement.innerHTML = createIconHTML('keyboard_capslock');
                    if (this.properties.capsLock) {
                        keyElement.classList.add('keyboard__key--active')
                    } else {
                        keyElement.classList.remove('keyboard__key--active')
                    }
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        this._toggleCapsLock();
                        keyElement.classList.toggle('keyboard__key--active', this.properties.capsLock);

                    });

                    break;

                case 'shift':
                    keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatables', 'key_16');
                    keyElement.innerHTML = createIconHTML('arrow_upward');
                    if (this.properties.isShift) {
                        keyElement.classList.add('keyboard__key--actives')
                    } else {
                        keyElement.classList.remove('keyboard__key--actives')
                    }
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')

                        this._toggleShift();
                        keyElement.classList.toggle('keyboard__key--actives', this.properties.shift);

                    });

                    break;
                case 'audio':
                    if (this.properties.isAudio) {
                        keyElement.classList.add('keyboard__key--actives')
                    }
                    keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatables');
                    keyElement.innerHTML = createIconHTML('music_note');
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        this._toggleAudio();
                        keyElement.classList.toggle('keyboard__key--actives', this.properties.isAudio);

                    });

                    break;

                case 'mic':

                    keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatables');
                    keyElement.innerHTML = createIconHTML('mic');

                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        this._toggleMic();
                        keyElement.classList.toggle('keyboard__key--actives', this.properties.isMic);

                    });

                    break;

                case 'enter':
                    keyElement.classList.add('keyboard__key--wide', 'key_enter');
                    keyElement.innerHTML = createIconHTML('keyboard_return');
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('enter')
                        const textPos = this._generateTextForPosition();
                        this.properties.value = `${textPos[1]}\n${textPos[2]}`;
                        textPos[0] += 1;
                        this._triggerEvent('oninput');
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);

                    });

                    break;
                case 'left':
                    keyElement.classList.add('keyboard__key--wide', 'key_37');
                    keyElement.innerHTML = createIconHTML('keyboard_arrow_left');
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        const textPos = this._generateTextForPosition();
                        textPos[0] = textPos[0] - 1 >= 0 ? textPos[0] - 1 : 0
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);

                    });

                    break;
                case 'right':
                    keyElement.classList.add('keyboard__key--wide', 'key_39');
                    keyElement.innerHTML = createIconHTML('keyboard_arrow_right');
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        const textPos = this._generateTextForPosition();
                        textPos[0] += 1
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);

                    });

                    break;
                case 'space':
                    keyElement.classList.add('keyboard__key--extra-wide', 'key_32');
                    keyElement.innerHTML = createIconHTML('space_bar');

                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('space')
                        const textPos = this._generateTextForPosition();
                        this.properties.value = `${textPos[1]} ${textPos[2]}`;
                        textPos[0] += 1;

                        this._triggerEvent('oninput');
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
                    });

                    break;
                case 'EN':
                    keyElement.classList.add('keyboard__key--wide');
                    keyElement.textContent = key;
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        if (this.properties.lang === 'en' || this.properties.lang === 'shiftEn') {
                            this.properties.lang = 'ru';

                        } else if (this.properties.lang === 'ru' || this.properties.lang === 'shiftRu') {
                            this.properties.lang = 'en';

                        }
                        this.init()
                        this._drawKeyboard();
                        this.elements.main.classList.remove('keyboard--hidden');

                    });

                    break;

                case 'RU':
                    keyElement.classList.add('keyboard__key--wide');

                    keyElement.textContent = key;
                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('shift')
                        if (this.properties.lang === 'en' || this.properties.lang === 'shiftEn') {
                            this.properties.lang = 'ru';

                        } else if (this.properties.lang === 'ru' || this.properties.lang === 'shiftRu') {
                            this.properties.lang = 'en';

                        }
                        this.init()
                        this._drawKeyboard();
                        this.elements.main.classList.remove('keyboard--hidden');

                    });

                    break;

                case 'done':
                    keyElement.classList.add('keyboard__key--wide', 'keyboard__key--dark');
                    keyElement.innerHTML = createIconHTML('check_circle');

                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('enter')
                        this.close();
                        this._triggerEvent('onclose');

                    });

                    break;

                default:

                    keyElement.textContent = key;
                    if (key > 'a' && key < 'z' || key > 'A' && key < 'Z') {
                        keyElement.classList.add(`key_${key}`);
                    } else {
                        keyElement.classList.add(`key_${key.charCodeAt()}`);
                    }

                    keyElement.addEventListener('click', () => {
                        this._getAudioKey('button')
                        const textPos = this._generateTextForPosition();
                        this.properties.value = (this.properties.capsLock && this.properties.isShift) ||
                            (!this.properties.capsLock && !this.properties.isShift) ? `${textPos[1]}${key.toLowerCase()}${textPos[2]}` : `${textPos[1]}${key.toUpperCase()}${textPos[2]}`;
                        textPos[0] += 1;
                        this._triggerEvent('oninput');
                        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
                        if (this.properties.isShift) {

                            this.properties.isShift = false;
                            this.init();

                            this.elements.main.classList.remove('keyboard--hidden');
                        }
                        this._drawKeyboard();
                    });

                    break;
            }

            fragment.appendChild(keyElement);

            if (insertLineBreak) {
                fragment.appendChild(document.createElement('br'));
            }
        });

        return fragment;
    },
    _getAudioKey(button) {

        if (this.properties.isAudio) {
            let audioName = '';
            if (this.properties.lang === 'en') {
                audioName = '_EN'
            } else {
                audioName = '_RU'
            }
            let audio = new Audio(`assets/audio/${button}${audioName}.mp3`);
            audio.play();
        }

    },

    _toggleMic() {

        this.properties.isMic = !this.properties.isMic;
        if (this.properties.isMic) {
           if(!this.rec){
              this.rec = new SpeechRecognizer(this._handleRecognition); 
           }
            this.rec.start();
        } else {
            this.rec.stop();
        };

    },
    _handleRecognition(e) {
        const newText = e.replaceAll(this.prevVoice, '');
        this.prevVoice = e;
        const textPos = Keyboard._generateTextForPosition();
        Keyboard.properties.value = `${textPos[1]}${newText}${textPos[2]}`;
        textPos[0] += newText.length;
        Keyboard._triggerEvent('oninput');
        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
    },

    _getCursorPosition() {
        var CaretPos = 0;
        const inputText = document.querySelector('.use-keyboard-input');
        if (document.selection) {
            inputText.focus();
            var Sel = document.selection.createRange();
            Sel.moveStart('character', -inputText.value.length);
            CaretPos = Sel.text.length;
        } else if (inputText.selectionStart || inputText.selectionStart == '0') {
            CaretPos = inputText.selectionStart;
        }
        document.querySelector('.keyboard').classList.remove('keyboard--hidden');
        return CaretPos;
    },

    _triggerEvent(handlerName) {
        if (typeof this.eventHandlers[handlerName] == 'function') {
            this.eventHandlers[handlerName](this.properties.value);
        }
    },

    _toggleCapsLock() {
        this.properties.capsLock = !this.properties.capsLock;
        this._drawKeyboard();

    },
    _toggleShift() {
        this.properties.isShift = !this.properties.isShift;
        this.init()
        this._drawKeyboard();
        this.elements.main.classList.remove('keyboard--hidden');

    },
    _toggleAudio() {
        this.properties.isAudio = !this.properties.isAudio;
    },
    _getRealKey(keyCode, key) {
        let keyElement;
        if (key > 'a' && key < 'z' || key > 'A' && key < 'Z' ) {
            keyElement = document.querySelector(`.key_${key.toLowerCase()}`);
        } else {
            keyElement = document.querySelector(`.key_${keyCode}`);
        }
        if (keyElement) {
            keyElement.classList.add('active-key');
        }
        const textPos = this._generateTextForPosition();
        if (key === 'Enter') {
            const textPos = this._generateTextForPosition();
            this.properties.value = `${textPos[1]}\n${textPos[2]}`;
            textPos[0] += 1;
            this._triggerEvent('oninput');
            document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
        } else {
            this.properties.value = `${textPos[1]}${this.properties.capsLock ? key.toLocaleUpperCase() : key }${textPos[2]}`;
        }
        textPos[0] += 1;

        this._triggerEvent('oninput');
        document.querySelector('.use-keyboard-input').setSelectionRange(textPos[0], textPos[0]);
        if (keyElement) {
            setTimeout(function () {
                keyElement.classList.remove('active-key');
            }, 200)
        }
    },

    open(initialValue, oninput, onclose) {
        this.properties.value = initialValue || '';
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.remove('keyboard--hidden');
    },

    close() {
        this.properties.value = '';
        this.eventHandlers.oninput = oninput;
        this.eventHandlers.onclose = onclose;
        this.elements.main.classList.add('keyboard--hidden');
    }

};

window.addEventListener('DOMContentLoaded', function () {
    Keyboard.init();
});

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

document.querySelector('.use-keyboard-input').addEventListener('blur', function () {
    this.focus()
})

document.querySelector('.use-keyboard-input').addEventListener('click', Keyboard._getCursorPosition);
document.querySelector('.use-keyboard-input').addEventListener('keypress', (event) => {
    event.preventDefault()
    const keyCode = event.keyCode;
    const key = event.key;
    Keyboard._getRealKey(keyCode, key);
})

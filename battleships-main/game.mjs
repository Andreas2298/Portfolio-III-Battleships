import { ANSI } from "./utils/ansi.mjs";
import { print, clearScreen } from "./utils/io.mjs";
import SplashScreen from "./game/splash.mjs";
import { FIRST_PLAYER, SECOND_PLAYER } from "./consts.mjs";
import createMenu from "./utils/menu.mjs";
import createMapLayoutScreen from "./game/mapLayoutScreen.mjs";
import createInnBetweenScreen from "./game/innbetweenScreen.mjs";
import createBattleshipScreen from "./game/battleshipsScreen.mjs";
import DICTIONARY from "./game/Language.mjs";
import readline from "readline"; 

const { width, height } = checkBoardRes();

function checkBoardRes() {
  const width = process.stdout.columns;
  const height = process.stdout.rows;

  return { width, height };
}

if (width < 110) {
  throw new Error(
    "Terminal must be wider than 110px. " +
      "It is now only " +
      width +
      "px wide"
  );
} else if (height < 28) {
  throw new Error(
    "Terminal must be higher than 28px. " +
      "It is now only " +
      height +
      "px high"
  );
}

const MAIN_MENU_ITEMS = buildMenu();

const GAME_FPS = 1000 / 60; // The theoretical refresh rate of our game engine
let currentState = null;    // The current active state in our finite-state machine.
let gameLoop = null;        // Variable that keeps a refrence to the interval id assigned to our game loop 

let mainMenuScene = null;

(function initialize() {
    print(ANSI.HIDE_CURSOR);
    clearScreen();
    mainMenuScene = createMenu(MAIN_MENU_ITEMS);
    SplashScreen.next = mainMenuScene;
    currentState = SplashScreen  // This is where we decide what state our finite-state machine will start in. 
    gameLoop = setInterval(update, GAME_FPS); // The game is started.
})();

function update() {
    currentState.update(GAME_FPS);
    currentState.draw(GAME_FPS);
    if (currentState.transitionTo != null) {
        currentState = currentState.next;
        print(ANSI.CLEAR_SCREEN, ANSI.CURSOR_HOME);
    }
}

// Suport / Utility functions ---------------------------------------------------------------

function buildMenu() {
    let menuItemCount = 0;
    return [
        {
            text: "Start Game", id: menuItemCount++, action: function () {
                clearScreen();
                let innbetween = createInnBetweenScreen();
                innbetween.init(`SHIP PLACMENT\nFirst player get ready.\nPlayer two look away`, () => {

                    let p1map = createMapLayoutScreen();
                    p1map.init(FIRST_PLAYER, (player1ShipMap) => {


                        let innbetween = createInnBetweenScreen();
                        innbetween.init(`SHIP PLACMENT\nSecond player get ready.\nPlayer one look away`, () => {
                            let p2map = createMapLayoutScreen();
                            p2map.init(SECOND_PLAYER, (player2ShipMap) => {
                                return createBattleshipScreen(player1ShipMap, player2ShipMap);
                            })
                            return p2map;
                        });
                        return innbetween;
                    });

                    return p1map;

                }, 3);
                currentState.next = innbetween;
                currentState.transitionTo = "Map layout";
            },
        },
        { 
        
        text: "Exit Game", 
         id: menuItemCount++, 
         action: function () { 
         print(ANSI.SHOW_CURSOR); 
         clearScreen(); 
         process.exit(); 
      
      }, 
        },
     
      {
    text: "Select your preferred language",
      id: menuItemCount++,
      action: function () {
        print(ANSI.SHOW_CURSOR);
        selectLanguage(function (selectedLanguage) {
          language = selectedLanguage;
          console.log(`Language is: ${language}`);
     });
      },
    },
  ];
}
function selectLanguage(callback) {
  clearScreen();

  console.log("Select language:\n");
  console.log("1. English\n");
  console.log("2. Norsk\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

 rl.question("Enter your choice here:", (selectedLanguage) => {
    if (selectedLanguage === "1") {
      language = "en";
    } else if (selectedLanguage === "2") {
      language = "no";
    } else {
      console.log("Invalid Choice");
      language = "en";
    }

    console.log(
      `The language is set to: ${translate("Preferred_language")})\n`
    );
    rl.close();
    if (callback) {
      callback(language);
    }
  });
}
  


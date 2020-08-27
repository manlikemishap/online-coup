import React, { useState, useEffect } from "react";
import uniqid from "uniqid";
import classNames from "classnames";
import { cards } from "../../logic/cards";
import "./ChoosingPanel.scss";
import { LobbyAPI } from "../../../LobbyAPI";

const api = new LobbyAPI();

const ChoosingPanel = ({ G, ctx, playerID, moves, gameID }) => {
  const isYourTurn = playerID === ctx.currentPlayer;
  const [choices, setChoices] = useState([]);

  // image loading optimization: prepare to reveal a card
  if (G.turnLog.action === "exchange" && G.turnLog.successful && isYourTurn) {
    cards.forEach((card) => {
      const img = new Image();
      img.src = card.front;
    });
  }

  let stealBlocks = [cards[3], cards[2]];

  if (G.turnLog.action === "steal" && playerID === G.turnLog.target.id) {
    stealBlocks.forEach((card) => {
      const img = new Image();
      img.src = card.front;
    });
  }

  useEffect(() => {
    const coup = (character) => {
      moves.coup(character);
    };

    const setHand = (cardID) => {
      moves.setHand(cardID);
    };

    const allow = () => {
      moves.allow(playerID);
    };

    const block = () => {
      moves.block(playerID);
    };

    const setBlock = (character) => {
      moves.block(playerID, character);
    };

    const challenge = () => {
      moves.initiateChallenge(playerID);
    };

    const leaveRoom = () => {
      api.leaveRoom(gameID, localStorage.getItem("id"), localStorage.getItem("credentials")).then(() => {
        localStorage.clear();
        window.location.href = "/";
      });
    };

    let temp = [];

    // game has ended
    if (G.winner.id !== "-1") {
      temp.push(
        <button key={uniqid()} className="leave-btn-big" onClick={leaveRoom}>
          leave
        </button>
      );
    }
    // show blocked choices
    else if (
      G.turnLog.action === "steal" &&
      Object.keys(G.turnLog.blockedBy).length !== 0 &&
      G.turnLog.blockedBy.character === "" &&
      ctx.activePlayers[playerID] === "blockOrChallenge"
    ) {
      temp.push(
        <img
          key={uniqid()}
          className="character-choice"
          onClick={() => setBlock("Ambassador")}
          src={"/images/ambassador.PNG"}
          alt={"Ambassador"}
        />
      );
      temp.push(
        <img
          key={uniqid()}
          className="character-choice"
          onClick={() => setBlock("Captain")}
          src={"/images/captain.PNG"}
          alt={"Captain"}
        />
      );
    }
    // show all possible cards
    else if (G.turnLog.action === "coup" && isYourTurn) {
      // image loading optimization with hidden
      cards.forEach((card) => {
        temp.push(
          <img
            key={uniqid()}
            className="character-choice"
            onClick={() => {
              coup(card.character);
            }}
            src={card.front}
            alt={card.name}
            hidden={Object.keys(G.turnLog.target).length === 0}
          />
        );
      });
    }
    // show the top two cards
    else if (G.turnLog.action === "exchange" && isYourTurn) {
      // image loading optimization with hidden
      G.turnLog.exchange.drawnCards.forEach((card) => {
        const cardSelected =
          G.turnLog.exchange.hasOwnProperty("newHand") && G.turnLog.exchange.newHand.includes(card.id);
        temp.push(
          <img
            key={uniqid()}
            className={classNames("big-character-choice", {
              "card-selected": cardSelected,
            })}
            onClick={() => {
              setHand(card.id);
            }}
            src={card.front}
            alt={card.name}
            hidden={!G.turnLog.successful || ctx.activePlayers[playerID] !== "action"}
          />
        );
      });
    }
    // show possible player responses
    else if (!G.players[playerID].isOut && G.turnLog.responses[playerID] === "") {
      if (ctx.activePlayers[playerID] === "block") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={block}>
            block
          </button>
        );
      } else if (ctx.activePlayers[playerID] === "challenge") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={challenge}>
            challenge
          </button>
        );
      } else if (ctx.activePlayers[playerID] === "blockOrChallenge") {
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={allow}>
            allow
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={block}>
            block
          </button>
        );
        temp.push(
          <button key={uniqid()} className="choice-btn" onClick={challenge}>
            challenge
          </button>
        );
      }
    }
    setChoices(temp);
  }, [G.turnLog, G.players, ctx.currentPlayer, ctx.activePlayers, playerID, moves, isYourTurn, G.winner.id, gameID]);

  return <div className="choosing-panel">{choices}</div>;
};

export default ChoosingPanel;
Project: Soccer11

Deployment target: https://jiwang308-debug.github.io/soccer11/

# 🎮 Two-Player Soccer Duel Game Rules

## 1. Game Overview

This is a **real-time two-player soccer mini-game**.

- Exactly two players
- Each player controls one character
- Only two core action buttons:
  - **Shoot**
  - **Tackle**
- Objective: Score more goals within the time limit

---

## 2. Basic Settings

### Players
- Player 1
- Player 2

### Match Duration
- Standard match length: 3 minutes (adjustable)
- Player with higher score wins
- If tied → 30-second overtime
- If still tied → optional penalty shootout

---

## 3. Field Rules

- Horizontal soccer field
- One goal on each side
- Player 1 defends the left goal
- Player 2 defends the right goal
- Kickoff starts from midfield

---

## 4. Controls

Each player has:

- Movement controls (keyboard or joystick)
- Shoot button
- Tackle button

---

## 5. Core Mechanics

### ⚽ Ball Possession

- When a player is close to the ball, it automatically attaches (possession state)
- The player with possession can:
  - Move
  - Shoot
- The player without possession can:
  - Move
  - Tackle

---

### 🥅 Shooting Rules

When in possession:

- Press Shoot → Ball travels in facing direction
- Shooting success depends on distance:
  - Closer to goal = higher success rate
- Shooting cooldown: 2 seconds

Shot outcomes:
- Goal → +1 point
- Blocked or missed → Ball becomes free

---

### 🛡 Tackle Rules

When close to the opponent and pressing Tackle:

- Base success rate (recommended: 60%)
- If successful → Gain possession
- If failed → Brief stun (0.5 seconds)

Tackle cooldown: 1.5 seconds

---

## 6. Goal Rules

- A goal is scored when the ball fully crosses the goal line
- After scoring:
  - Both players reset to midfield
  - Possession randomly assigned

---

## 7. Collision Rules

- Light physical collision between players
- Ball direction can change due to body contact
- No foul or penalty system (simplified gameplay)

---

## 8. Win Condition

- Player with higher score at end of match wins
- Tie → Overtime
- Tie after overtime → Sudden death (next goal wins)

---

## 9. Optional Balance Enhancements

To increase strategic depth:

- Charge-based shooting
- Directional tackle mechanics
- Stamina system (reduces repeated tackle success)
- Lower accuracy for long-range shots
- AI goalkeeper

---

## 10. Game Design Goals

- 3–5 minutes per match
- Simple controls
- Fast-paced competitive gameplay
- Focus on:
  - Timing
  - Positioning
  - Psychological strategy

---

## 🎯 Core Gameplay Loop

The core cycle of the game:

> Gain possession → Find angle → Shoot  
> Defend → Close distance → Tackle  

Two buttons, but distance, cooldown, and probability create meaningful strategy and competitive tension.

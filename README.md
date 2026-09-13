<img width="1280" height="640" alt="git (1)" src="https://github.com/user-attachments/assets/8920b256-2ba8-4988-b824-5351134eb4bd" />



# POSTURE CHAMPION


## Basic Details
### Team Name: Infinite loop


### Team Members
- Team Lead: Afrin Asif - NSS College of Engineering
- Member 2: Anna Rose Pynadath - NSS College of Engineering

### Project Description
**Posture Champion** is a ridiculous multiplayer competition where players compete to find out who has the best posture.

Using a webcam and real-time **MediaPipe pose detection**, the application analyzes each player's body alignment and calculates a posture score. After everyone has taken their turn, the players are ranked and one person is crowned the ultimate **Posture Champion**. 🏆

### The Problem (that doesn't exist)
We realized there is a serious problem in society:

**Nobody knows who among their friends has the best posture.**

People can compete in sports, academics and video games... but what about sitting and standing unnecessarily straight?

This project solves this completely imaginary crisis.

### The Solution (that nobody asked for)
Posture Champion turns good posture into a full-blown tournament.

Players take turns standing in front of a webcam while computer vision analyzes their posture. The system evaluates body alignment and produces a calculated percentage score.

Once every player has competed, the application generates a leaderboard and crowns the player with the highest score as the **POSTURE CHAMPION**.

Because apparently, this needed to be competitive.

## Technical Details
### Technologies/Components Used
For Software:
- **Language:** TypeScript
- **Framework:** React
- **Build Tool:** Vite
- **Computer Vision:** MediaPipe Pose Landmarker
- **Web APIs:** Browser Camera API (`getUserMedia`)
- **Styling:** HTML5 / CSS3
- **Version Control:** Git & GitHub
- **Deployment:** Vercel


### Implementation
For Software:
# Installation
bash
npm install

# Run
npm run dev

### Project Documentation
For Software:

## 📸 Screenshots

### 1. Home / Match Setup

![Home / Match Setup]
https://drive.google.com/file/d/1fNHKbGqwnxvFwJwSznUIveUTuo4aVNWF/view?usp=drive_link

*This screen allows users to set up and start a new match.*

### 2. Match in Progress

![Match in Progress]
https://drive.google.com/file/d/1wwVkXWfp1KI85AvA0sacrlcZGvHk5UtL/view?usp=drive_link

*This screen shows the ongoing match and user interactions.*

### 3. Results Screen

![Results Screen]
https://drive.google.com/file/d/1bG3X0xAcWhR4rEGxt757pQXj13MFYhn6/view?usp=drive_link

*This screen displays the final results or outcome.*


# Diagrams
Player_Setup[Player Setup] --> Player_Ready[Player Gets Ready]
    Player_Ready --> Webcam[Webcam Activation]
    Webcam --> Pose_Detection[Pose Detection]
    Pose_Detection --> Posture_Analysis[Posture Analysis]
    Posture_Analysis --> Score[Posture Score Calculation]
    Score --> More_Players{More Players?}
    More_Players -->|Yes| Player_Ready
    More_Players -->|No| Leaderboard[Final Leaderboard]
    Leaderboard --> Winner[Winner Selection]
    Winner --> Champion[🏆 Posture Champion]




### Project Demo
# Video
https://drive.google.com/file/d/1J4C7yFknVomz6OtSOWeqobReM5yB_kYb/view?usp=drive_link


# Additional Demos
Live application: https://posture-competition.vercel.app/

## Team Contributions
## Team Contributions

- **Anna Rose:** Full-stack project development, React frontend, MediaPipe pose detection integration, posture scoring system, and multiplayer competition flow.

- **Afrin Asif:** UI/UX design, visual styling, testing, deployment, documentation, and project presentation.

---
Made with ❤️ at TinkerHub Useless Projects 

![Static Badge](https://img.shields.io/badge/TinkerHub-24?color=%23000000&link=https%3A%2F%2Fwww.tinkerhub.org%2F)
![Static Badge](https://img.shields.io/badge/UselessProjects--26-26?link=https%3A%2F%2Ftinkerhub.org%2Fevents%2F1M8ORET9A1%2Fuseless-projects-3.0)

// Game elements
const loginScreen = document.getElementById("login-screen")
const registerScreen = document.getElementById("register-screen")
const startScreen = document.getElementById("start-screen")
const gameScreen = document.getElementById("game-screen")
const gameOverScreen = document.getElementById("game-over-screen")
const pauseScreen = document.getElementById("pause-screen")
const highScoresScreen = document.getElementById("high-scores-screen")

// Auth elements
const loginForm = document.getElementById("login-form")
const registerForm = document.getElementById("register-form")
const showRegisterBtn = document.getElementById("show-register")
const showLoginBtn = document.getElementById("show-login")
const logoutButton = document.getElementById("logout-button")
const usernameDisplay = document.getElementById("username-display")
const loginError = document.getElementById("login-error")
const registerError = document.getElementById("register-error")

// Game buttons
const startButton = document.getElementById("start-button")
const restartButton = document.getElementById("restart-button")
const resumeButton = document.getElementById("resume-button")
const quitButton = document.getElementById("quit-button")
const mainMenuButton = document.getElementById("main-menu-button")
const highScoresButton = document.getElementById("high-scores-button")
const backButton = document.getElementById("back-button")

// Game elements
const scoreElement = document.getElementById("score")
const levelElement = document.getElementById("level")
const livesElement = document.getElementById("lives")
const powerLevelElement = document.getElementById("power-level")
const finalScoreElement = document.getElementById("final-score")
const newHighScoreDiv = document.getElementById("new-high-score")
const scoresList = document.getElementById("scores-list")
const canvas = document.getElementById("game-canvas")
const ctx = canvas.getContext("2d")

// Difficulty buttons
const easyButton = document.getElementById("easy-button")
const mediumButton = document.getElementById("medium-button")
const hardButton = document.getElementById("hard-button")

// Leaderboard filters
const allTimeScoresBtn = document.getElementById("all-time-scores")
const monthlyScoresBtn = document.getElementById("monthly-scores")
const weeklyScoresBtn = document.getElementById("weekly-scores")

// Ship selection
const shipOptions = document.querySelectorAll(".ship-option")

// Game state
let gameId = null
let score = 0
let level = 1
let lives = 3
let powerLevel = 0
let gameOver = false
let isPaused = false
let animationFrameId = null
let lastFrameTime = 0
let difficulty = "easy"
let selectedShip = "blue"
let currentUser = null
let authToken = null

// Player state
const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 60,
  width: 40,
  height: 40,
  speed: 5,
  isShooting: false,
  isUsingSpecial: false,
  specialCooldown: 0,
  specialDuration: 0,
  hasShield: false,
  shieldDuration: 0,
  color: "#88f",
}

// Game objects
let enemies = []
let projectiles = []
let powerUps = []
let particles = []
const stars = []
let bosses = []

// Input handling
const keys = {}

// Backend API URL
const API_URL = "/api"

// CSRF token
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute("content")
}

// API helper function
async function apiCall(endpoint, method = "GET", data = null) {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRFToken": getCSRFToken(),
  }

  if (authToken) {
    headers["Authorization"] = `Token ${authToken}`
  }

  const config = {
    method,
    headers,
    credentials: "same-origin",
  }

  if (data) {
    config.body = JSON.stringify(data)
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "API call failed")
    }

    return result
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Sound effects (same as before)
const sounds = {
  shoot: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACAgICAgICAgICAgICAgICAgICAgICBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYG",
  ),
  explosion: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=",
  ),
  powerUp: new Audio(
    "data:audio/wav;base64,UklGRjQGAABXQVZFZm10IBAAAAABAAEARKwAAESsAAABAAgAZGF0YRAGAACBgYGCgoKDg4OEhISFhYWGhoaHh4eIiIiJiYmKioqLi4uMjIyNjY2Ojo6Pj4+QkJCRkZGSkpKTk5OUlJSVlZWWlpaXl5eYmJiZmZmampqbm5ucnJydnZ2enp6fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=",
  ),
}

// Initialize stars
for (let i = 0; i < 100; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    opacity: Math.random() * 0.8 + 0.2,
    speed: Math.random() * 0.5 + 0.1,
  })
}

// Authentication Event Listeners
loginForm.addEventListener("submit", handleLogin)
registerForm.addEventListener("submit", handleRegister)
showRegisterBtn.addEventListener("click", showRegisterScreen)
showLoginBtn.addEventListener("click", showLoginScreen)
logoutButton.addEventListener("click", handleLogout)

// Game Event Listeners
startButton.addEventListener("click", startGame)
restartButton.addEventListener("click", startGame)
resumeButton.addEventListener("click", resumeGame)
quitButton.addEventListener("click", quitGame)
mainMenuButton.addEventListener("click", goToMainMenu)
highScoresButton.addEventListener("click", showHighScores)
backButton.addEventListener("click", goToMainMenu)

// Difficulty selection
easyButton.addEventListener("click", () => setDifficulty("easy"))
mediumButton.addEventListener("click", () => setDifficulty("medium"))
hardButton.addEventListener("click", () => setDifficulty("hard"))

// Leaderboard filters
allTimeScoresBtn.addEventListener("click", () => loadLeaderboard("all"))
monthlyScoresBtn.addEventListener("click", () => loadLeaderboard("month"))
weeklyScoresBtn.addEventListener("click", () => loadLeaderboard("week"))

// Ship selection
shipOptions.forEach((option) => {
  option.addEventListener("click", () => {
    shipOptions.forEach((opt) => opt.classList.remove("selected"))
    option.classList.add("selected")
    selectedShip = option.getAttribute("data-ship")

    // Update player ship color
    switch (selectedShip) {
      case "blue":
        player.color = "#88f"
        break
      case "red":
        player.color = "#f55"
        break
      case "green":
        player.color = "#5f5"
        break
    }
  })
})

// Authentication Functions
async function handleLogin(e) {
  e.preventDefault()

  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value

  try {
    const result = await apiCall("/auth/login/", "POST", {
      username,
      password,
    })

    authToken = result.token
    currentUser = result.user
    usernameDisplay.textContent = currentUser.username

    showStartScreen()
    hideError(loginError)
  } catch (error) {
    showError(loginError, error.message)
  }
}

async function handleRegister(e) {
  e.preventDefault()

  const username = document.getElementById("register-username").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value
  const passwordConfirm = document.getElementById("register-password-confirm").value

  if (password !== passwordConfirm) {
    showError(registerError, "Passwords do not match")
    return
  }

  try {
    const result = await apiCall("/auth/register/", "POST", {
      username,
      email,
      password,
    })

    authToken = result.token
    currentUser = result.user
    usernameDisplay.textContent = currentUser.username

    showStartScreen()
    hideError(registerError)
  } catch (error) {
    showError(registerError, error.message)
  }
}

async function handleLogout() {
  try {
    await apiCall("/auth/logout/", "POST")
  } catch (error) {
    console.error("Logout error:", error)
  }

  authToken = null
  currentUser = null
  showLoginScreen()
}

function showRegisterScreen() {
  loginScreen.classList.add("hidden")
  registerScreen.classList.remove("hidden")
}

function showLoginScreen() {
  registerScreen.classList.add("hidden")
  loginScreen.classList.remove("hidden")
}

function showStartScreen() {
  loginScreen.classList.add("hidden")
  registerScreen.classList.add("hidden")
  startScreen.classList.remove("hidden")
}

function showError(element, message) {
  element.textContent = message
  element.classList.remove("hidden")
}

function hideError(element) {
  element.classList.add("hidden")
}

// Game Functions (updated for Django backend)
async function startGame() {
  // Reset game state
  score = 0
  level = 1
  lives = 3
  powerLevel = 0
  gameOver = false
  isPaused = false
  enemies = []
  projectiles = []
  powerUps = []
  particles = []
  bosses = []

  // Reset player position
  player.x = canvas.width / 2 - 20
  player.y = canvas.height - 60
  player.hasShield = false
  player.shieldDuration = 0
  player.specialCooldown = 0
  player.specialDuration = 0

  // Update UI
  scoreElement.textContent = score
  levelElement.textContent = level
  livesElement.textContent = lives
  powerLevelElement.textContent = powerLevel

  // Show game screen
  startScreen.classList.add("hidden")
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.add("hidden")
  gameScreen.classList.remove("hidden")

  // Initialize game on server
  try {
    const result = await apiCall("/game/start/", "POST", {
      difficulty: difficulty,
      ship: selectedShip,
    })

    gameId = result.game_id

    // Start game loop
    lastFrameTime = performance.now()
    gameLoop(lastFrameTime)
  } catch (error) {
    console.error("Failed to start game:", error)
    // Fallback to client-side game if server is unavailable
    gameId = "local-" + Date.now()
    lastFrameTime = performance.now()
    gameLoop(lastFrameTime)
  }
}

async function endGame() {
  gameOver = true
  finalScoreElement.textContent = score
  gameScreen.classList.add("hidden")
  gameOverScreen.classList.remove("hidden")

  // Save score to server
  try {
    const result = await apiCall("/game/end/", "POST", {
      game_id: gameId,
      score: score,
      level: level,
    })

    if (result.is_high_score) {
      newHighScoreDiv.classList.remove("hidden")
    } else {
      newHighScoreDiv.classList.add("hidden")
    }
  } catch (error) {
    console.error("Failed to save score:", error)
    newHighScoreDiv.classList.add("hidden")
  }

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

async function showHighScores() {
  startScreen.classList.add("hidden")
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.remove("hidden")

  await loadLeaderboard("all")
}

async function loadLeaderboard(period = "all") {
  try {
    const result = await apiCall(`/game/leaderboard/?period=${period}`)
    displayLeaderboard(result.scores)

    // Update filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("selected"))
    if (period === "all") allTimeScoresBtn.classList.add("selected")
    else if (period === "month") monthlyScoresBtn.classList.add("selected")
    else if (period === "week") weeklyScoresBtn.classList.add("selected")
  } catch (error) {
    console.error("Failed to load leaderboard:", error)
  }
}

function displayLeaderboard(scores) {
  scoresList.innerHTML = ""

  scores.forEach((scoreData, index) => {
    const scoreItem = document.createElement("div")
    scoreItem.className = "score-item"

    const rankSpan = document.createElement("span")
    rankSpan.className = "score-rank"
    rankSpan.textContent = `${index + 1}.`

    const nameSpan = document.createElement("span")
    nameSpan.className = "score-name"
    nameSpan.textContent = scoreData.username

    const valueSpan = document.createElement("span")
    valueSpan.className = "score-value"
    valueSpan.textContent = scoreData.score

    const dateSpan = document.createElement("span")
    dateSpan.className = "score-date"
    dateSpan.textContent = new Date(scoreData.created_at).toLocaleDateString()

    scoreItem.appendChild(rankSpan)
    scoreItem.appendChild(nameSpan)
    scoreItem.appendChild(valueSpan)
    scoreItem.appendChild(dateSpan)

    scoresList.appendChild(scoreItem)
  })
}

// Rest of the game functions remain the same...
// (Including setDifficulty, goToMainMenu, togglePause, resumeGame, quitGame, gameLoop, etc.)

function setDifficulty(level) {
  difficulty = level

  // Update UI
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("selected")
  })

  document.getElementById(`${level}-button`).classList.add("selected")

  // Adjust game parameters based on difficulty
  switch (level) {
    case "easy":
      player.speed = 5
      break
    case "medium":
      player.speed = 6
      break
    case "hard":
      player.speed = 7
      break
  }
}

function goToMainMenu() {
  gameOverScreen.classList.add("hidden")
  highScoresScreen.classList.add("hidden")
  pauseScreen.classList.add("hidden")
  startScreen.classList.remove("hidden")

  // Reset game state
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

function togglePause() {
  isPaused = !isPaused

  if (isPaused) {
    pauseScreen.classList.remove("hidden")
  } else {
    pauseScreen.classList.add("hidden")
    gameLoop(performance.now())
  }
}

function resumeGame() {
  isPaused = false
  pauseScreen.classList.add("hidden")
  gameLoop(performance.now())
}

function quitGame() {
  isPaused = false
  pauseScreen.classList.add("hidden")
  endGame()
}

// Input handling
window.addEventListener("keydown", (e) => {
  keys[e.key] = true

  // Shooting
  if (e.key === " ") {
    player.isShooting = true
  }

  // Special ability
  if (e.key === "e" || e.key === "E" || e.key === "Shift") {
    player.isUsingSpecial = true
  }

  // Pause game
  if (
    (e.key === "p" || e.key === "P" || e.key === "Escape") &&
    !gameOver &&
    !startScreen.classList.contains("hidden")
  ) {
    togglePause()
  }

  // Prevent scrolling with arrow keys and WASD
  if (
    [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
      "p",
      "P",
      "Escape",
      "e",
      "E",
      "Shift",
    ].includes(e.key)
  ) {
    e.preventDefault()
  }
})

window.addEventListener("keyup", (e) => {
  keys[e.key] = false

  if (e.key === " ") {
    player.isShooting = false
  }

  if (e.key === "e" || e.key === "E" || e.key === "Shift") {
    player.isUsingSpecial = false
  }
})

// Game loop and rendering functions (same as original)
async function gameLoop(timestamp) {
  if (gameOver || isPaused) return

  // Calculate delta time
  const deltaTime = timestamp - lastFrameTime
  lastFrameTime = timestamp

  // Clear canvas
  ctx.fillStyle = "black"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Draw stars (background)
  updateStars(deltaTime)
  drawStars()

  // Update game state locally (simplified for demo)
  updateGameLocally(deltaTime)

  // Draw game objects
  drawPlayer()
  drawEnemies()
  drawProjectiles()
  drawPowerUps()
  drawParticles()
  drawBosses()

  // Continue game loop
  animationFrameId = requestAnimationFrame(gameLoop)
}

// Include all the original game logic functions here...
// (updateGameLocally, checkCollisions, createExplosion, updateStars, draw functions, etc.)

function updateGameLocally(deltaTime) {
  // Update player position based on key presses (Arrow keys and WASD)
  if ((keys["ArrowLeft"] || keys["a"] || keys["A"]) && player.x > 0) {
    player.x -= player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowRight"] || keys["d"] || keys["D"]) && player.x < canvas.width - player.width) {
    player.x += player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowUp"] || keys["w"] || keys["W"]) && player.y > 0) {
    player.y -= player.speed * (deltaTime / 16)
  }
  if ((keys["ArrowDown"] || keys["s"] || keys["S"]) && player.y < canvas.height - player.height) {
    player.y += player.speed * (deltaTime / 16)
  }

  // Handle shooting
  if (player.isShooting) {
    const now = performance.now()
    if (!player.lastShot || now - player.lastShot > 300) {
      // Create projectile
      const projectile = {
        x: player.x + player.width / 2 - 2,
        y: player.y - 10,
        width: 4,
        height: 15,
        speed: 10,
        isPlayerProjectile: true,
        damage: 1 + Math.floor(powerLevel / 3),
      }

      projectiles.push(projectile)

      // Add side projectiles if power level is high enough
      if (powerLevel >= 2) {
        projectiles.push({
          x: player.x + 5,
          y: player.y,
          width: 3,
          height: 10,
          speed: 9,
          isPlayerProjectile: true,
          damage: 1,
        })

        projectiles.push({
          x: player.x + player.width - 8,
          y: player.y,
          width: 3,
          height: 10,
          speed: 9,
          isPlayerProjectile: true,
          damage: 1,
        })
      }

      // Play sound
      sounds.shoot.currentTime = 0
      sounds.shoot.play().catch((e) => console.log("Audio play error:", e))

      player.lastShot = now
    }
  }

  // Spawn enemies
  const enemySpawnRate = 0.02 + level * 0.005
  const adjustedSpawnRate = enemySpawnRate * (deltaTime / 16)

  if (Math.random() < adjustedSpawnRate) {
    const enemy = {
      x: Math.random() * (canvas.width - 40),
      y: -40,
      width: 40,
      height: 40,
      speed: 2 + level * 0.5,
      points: 10 * level,
      health: 1 + Math.floor(level / 3),
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    }

    enemies.push(enemy)
  }

  // Update projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      p.y -= p.speed * (deltaTime / 16)
      if (p.y < -p.height) {
        projectiles.splice(i, 1)
      }
    } else {
      p.y += p.speed * (deltaTime / 16)
      if (p.y > canvas.height) {
        projectiles.splice(i, 1)
      }
    }
  }

  // Update enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i]
    e.y += e.speed * (deltaTime / 16)

    if (e.y > canvas.height) {
      enemies.splice(i, 1)
    }
  }

  // Check collisions
  checkCollisions()

  // Update score display
  scoreElement.textContent = score
  levelElement.textContent = level
  livesElement.textContent = lives
  powerLevelElement.textContent = powerLevel

  // Check for level up
  if (Math.floor(score / 500) > level - 1) {
    level = Math.floor(score / 500) + 1
  }
}

function checkCollisions() {
  // Player projectiles hitting enemies
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      // Check collision with regular enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j]

        if (p.x < e.x + e.width && p.x + p.width > e.x && p.y < e.y + e.height && p.y + p.height > e.y) {
          // Collision detected
          projectiles.splice(i, 1)

          // Reduce enemy health
          e.health -= p.damage || 1

          if (e.health <= 0) {
            // Enemy destroyed
            enemies.splice(j, 1)
            score += e.points
            createExplosion(e.x + e.width / 2, e.y + e.height / 2)
          }
          break
        }
      }
    }
  }

  // Enemies hitting player
  if (!player.hasShield && !gameOver) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i]

      if (
        e.x < player.x + player.width &&
        e.x + e.width > player.x &&
        e.y < player.y + player.height &&
        e.y + e.height > player.y
      ) {
        // Collision detected
        enemies.splice(i, 1)

        // Reduce player lives
        lives--

        // Create explosion
        createExplosion(e.x + e.width / 2, e.y + e.height / 2)

        // Check game over
        if (lives <= 0) {
          endGame()
        }
      }
    }
  }
}

// Create explosion particles
function createExplosion(x, y) {
  // Play explosion sound
  sounds.explosion.currentTime = 0
  sounds.explosion.play().catch((e) => console.log("Audio play error:", e))

  // Create particles
  for (let i = 0; i < 15; i++) {
    particles.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5,
      radius: Math.random() * 4 + 2,
      color: `hsl(${Math.random() * 60}, 100%, 50%)`,
      life: 500,
    })
  }
}

// Update stars
function updateStars(deltaTime) {
  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    star.y += star.speed * (deltaTime / 16)

    if (star.y > canvas.height) {
      star.y = 0
      star.x = Math.random() * canvas.width
    }
  }
}

// Draw functions
function drawStars() {
  ctx.save()

  for (let i = 0; i < stars.length; i++) {
    const star = stars[i]
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
    ctx.beginPath()
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawPlayer() {
  ctx.save()

  // Draw player ship
  ctx.fillStyle = player.color

  // Ship shape based on selected ship
  switch (selectedShip) {
    case "blue":
      // Blue ship (triangle)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x, player.y + player.height)
      ctx.lineTo(player.x + player.width, player.y + player.height)
      ctx.closePath()
      ctx.fill()
      break
    case "red":
      // Red ship (diamond)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x + player.width, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width / 2, player.y + player.height)
      ctx.lineTo(player.x, player.y + player.height / 2)
      ctx.closePath()
      ctx.fill()
      break
    case "green":
      // Green ship (arrow)
      ctx.beginPath()
      ctx.moveTo(player.x + player.width / 2, player.y)
      ctx.lineTo(player.x + player.width, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width * 0.8, player.y + player.height / 2)
      ctx.lineTo(player.x + player.width * 0.8, player.y + player.height)
      ctx.lineTo(player.x + player.width * 0.2, player.y + player.height)
      ctx.lineTo(player.x + player.width * 0.2, player.y + player.height / 2)
      ctx.lineTo(player.x, player.y + player.height / 2)
      ctx.closePath()
      ctx.fill()
      break
  }

  // Draw shield if active
  if (player.hasShield) {
    ctx.strokeStyle = "#88f"
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.5 + Math.sin(performance.now() / 200) * 0.2
    ctx.beginPath()
    ctx.arc(player.x + player.width / 2, player.y + player.height / 2, player.width * 0.8, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.restore()
}

function drawEnemies() {
  ctx.save()

  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i]

    // Draw enemy ship
    ctx.fillStyle = enemy.color || "#f55"

    // Enemy shape (inverted triangle)
    ctx.beginPath()
    ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height)
    ctx.lineTo(enemy.x, enemy.y)
    ctx.lineTo(enemy.x + enemy.width, enemy.y)
    ctx.closePath()
    ctx.fill()
  }

  ctx.restore()
}

function drawBosses() {
  // Boss drawing logic (if needed)
}

function drawProjectiles() {
  ctx.save()

  for (let i = 0; i < projectiles.length; i++) {
    const p = projectiles[i]

    if (p.isPlayerProjectile) {
      // Player projectile
      ctx.fillStyle = selectedShip === "blue" ? "#88f" : selectedShip === "red" ? "#f55" : "#5f5"
      ctx.fillRect(p.x, p.y, p.width, p.height)
    } else {
      // Enemy projectile
      ctx.fillStyle = "#f55"
      ctx.fillRect(p.x, p.y, p.width, p.height)
    }
  }

  ctx.restore()
}

function drawPowerUps() {
  // Power-up drawing logic (if needed)
}

function drawParticles() {
  ctx.save()

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]

    ctx.globalAlpha = Math.min(1, p.life / 300)
    ctx.fillStyle = p.color || "#fff"
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
  ctx.restore()
}

// Check authentication status on page load
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const result = await apiCall("/auth/user/")
    if (result.user) {
      currentUser = result.user
      authToken = result.token
      usernameDisplay.textContent = currentUser.username
      showStartScreen()
    } else {
      showLoginScreen()
    }
  } catch (error) {
    showLoginScreen()
  }
})

-- Roblox Script Loader with Key System
-- Replace YOUR_API_URL with your actual Supabase function URL
-- Replace YOUR_KEY_URL with your actual get key page URL

local API_URL = "YOUR_SUPABASE_URL/functions/v1/validate-key"
local KEY_URL = "YOUR_WEBSITE_URL/getkey?key=YOUR_KEY_VALUE"

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

local function getHWID()
    local hwid = game:GetService("RbxAnalyticsService"):GetClientId()
    return hwid
end

local function createKeyUI()
    local player = Players.LocalPlayer
    local playerGui = player:WaitForChild("PlayerGui")

    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "KeySystemUI"
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    screenGui.ResetOnSpawn = false

    local mainFrame = Instance.new("Frame")
    mainFrame.Size = UDim2.new(0, 400, 0, 300)
    mainFrame.Position = UDim2.new(0.5, -200, 0.5, -150)
    mainFrame.BackgroundColor3 = Color3.fromRGB(30, 30, 35)
    mainFrame.BorderSizePixel = 0
    mainFrame.Parent = screenGui

    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 12)
    corner.Parent = mainFrame

    local titleFrame = Instance.new("Frame")
    titleFrame.Size = UDim2.new(1, 0, 0, 60)
    titleFrame.BackgroundColor3 = Color3.fromRGB(25, 25, 30)
    titleFrame.BorderSizePixel = 0
    titleFrame.Parent = mainFrame

    local titleCorner = Instance.new("UICorner")
    titleCorner.CornerRadius = UDim.new(0, 12)
    titleCorner.Parent = titleFrame

    local titleBottomCover = Instance.new("Frame")
    titleBottomCover.Size = UDim2.new(1, 0, 0, 12)
    titleBottomCover.Position = UDim2.new(0, 0, 1, -12)
    titleBottomCover.BackgroundColor3 = Color3.fromRGB(25, 25, 30)
    titleBottomCover.BorderSizePixel = 0
    titleBottomCover.Parent = titleFrame

    local title = Instance.new("TextLabel")
    title.Size = UDim2.new(1, -20, 1, 0)
    title.Position = UDim2.new(0, 10, 0, 0)
    title.BackgroundTransparency = 1
    title.Text = "Key System"
    title.TextColor3 = Color3.fromRGB(255, 255, 255)
    title.TextSize = 24
    title.Font = Enum.Font.GothamBold
    title.TextXAlignment = Enum.TextXAlignment.Left
    title.Parent = titleFrame

    local hwidLabel = Instance.new("TextLabel")
    hwidLabel.Size = UDim2.new(1, -40, 0, 20)
    hwidLabel.Position = UDim2.new(0, 20, 0, 75)
    hwidLabel.BackgroundTransparency = 1
    hwidLabel.Text = "Your HWID:"
    hwidLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
    hwidLabel.TextSize = 14
    hwidLabel.Font = Enum.Font.Gotham
    hwidLabel.TextXAlignment = Enum.TextXAlignment.Left
    hwidLabel.Parent = mainFrame

    local hwidBox = Instance.new("TextBox")
    hwidBox.Size = UDim2.new(1, -40, 0, 35)
    hwidBox.Position = UDim2.new(0, 20, 0, 100)
    hwidBox.BackgroundColor3 = Color3.fromRGB(40, 40, 45)
    hwidBox.BorderSizePixel = 0
    hwidBox.Text = getHWID()
    hwidBox.TextColor3 = Color3.fromRGB(255, 255, 255)
    hwidBox.TextSize = 12
    hwidBox.Font = Enum.Font.Code
    hwidBox.TextEditable = false
    hwidBox.ClearTextOnFocus = false
    hwidBox.Parent = mainFrame

    local hwidBoxCorner = Instance.new("UICorner")
    hwidBoxCorner.CornerRadius = UDim.new(0, 6)
    hwidBoxCorner.Parent = hwidBox

    local keyLabel = Instance.new("TextLabel")
    keyLabel.Size = UDim2.new(1, -40, 0, 20)
    keyLabel.Position = UDim2.new(0, 20, 0, 145)
    keyLabel.BackgroundTransparency = 1
    keyLabel.Text = "Enter Key:"
    keyLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
    keyLabel.TextSize = 14
    keyLabel.Font = Enum.Font.Gotham
    keyLabel.TextXAlignment = Enum.TextXAlignment.Left
    keyLabel.Parent = mainFrame

    local keyInput = Instance.new("TextBox")
    keyInput.Size = UDim2.new(1, -40, 0, 35)
    keyInput.Position = UDim2.new(0, 20, 0, 170)
    keyInput.BackgroundColor3 = Color3.fromRGB(40, 40, 45)
    keyInput.BorderSizePixel = 0
    keyInput.Text = ""
    keyInput.PlaceholderText = "Paste your key here"
    keyInput.TextColor3 = Color3.fromRGB(255, 255, 255)
    keyInput.PlaceholderColor3 = Color3.fromRGB(120, 120, 120)
    keyInput.TextSize = 14
    keyInput.Font = Enum.Font.Code
    keyInput.Parent = mainFrame

    local keyInputCorner = Instance.new("UICorner")
    keyInputCorner.CornerRadius = UDim.new(0, 6)
    keyInputCorner.Parent = keyInput

    local buttonContainer = Instance.new("Frame")
    buttonContainer.Size = UDim2.new(1, -40, 0, 40)
    buttonContainer.Position = UDim2.new(0, 20, 0, 220)
    buttonContainer.BackgroundTransparency = 1
    buttonContainer.Parent = mainFrame

    local getKeyButton = Instance.new("TextButton")
    getKeyButton.Size = UDim2.new(0.48, 0, 1, 0)
    getKeyButton.Position = UDim2.new(0, 0, 0, 0)
    getKeyButton.BackgroundColor3 = Color3.fromRGB(70, 130, 255)
    getKeyButton.BorderSizePixel = 0
    getKeyButton.Text = "Get Key"
    getKeyButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    getKeyButton.TextSize = 16
    getKeyButton.Font = Enum.Font.GothamBold
    getKeyButton.Parent = buttonContainer

    local getKeyCorner = Instance.new("UICorner")
    getKeyCorner.CornerRadius = UDim.new(0, 8)
    getKeyCorner.Parent = getKeyButton

    local submitButton = Instance.new("TextButton")
    submitButton.Size = UDim2.new(0.48, 0, 1, 0)
    submitButton.Position = UDim2.new(0.52, 0, 0, 0)
    submitButton.BackgroundColor3 = Color3.fromRGB(50, 200, 100)
    submitButton.BorderSizePixel = 0
    submitButton.Text = "Submit"
    submitButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    submitButton.TextSize = 16
    submitButton.Font = Enum.Font.GothamBold
    submitButton.Parent = buttonContainer

    local submitCorner = Instance.new("UICorner")
    submitCorner.CornerRadius = UDim.new(0, 8)
    submitCorner.Parent = submitButton

    local statusLabel = Instance.new("TextLabel")
    statusLabel.Size = UDim2.new(1, -40, 0, 20)
    statusLabel.Position = UDim2.new(0, 20, 0, 270)
    statusLabel.BackgroundTransparency = 1
    statusLabel.Text = ""
    statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100)
    statusLabel.TextSize = 12
    statusLabel.Font = Enum.Font.Gotham
    statusLabel.TextXAlignment = Enum.TextXAlignment.Center
    statusLabel.Parent = mainFrame

    getKeyButton.MouseButton1Click:Connect(function()
        setclipboard(KEY_URL)
        statusLabel.Text = "Link copied to clipboard!"
        statusLabel.TextColor3 = Color3.fromRGB(100, 200, 255)
        wait(2)
        statusLabel.Text = ""
    end)

    submitButton.MouseButton1Click:Connect(function()
        local key = keyInput.Text
        if key == "" then
            statusLabel.Text = "Please enter a key!"
            statusLabel.TextColor3 = Color3.fromRGB(255, 100, 100)
            return
        end

        statusLabel.Text = "Validating..."
        statusLabel.TextColor3 = Color3.fromRGB(255, 200, 100)

        local success, result = pcall(function()
            local requestData = {
                key = key,
                hwid = getHWID()
            }

            local response = HttpService:RequestAsync({
                Url = API_URL,
                Method = "POST",
                Headers = {
                    ["Content-Type"] = "application/json"
                },
                Body = HttpService:JSONEncode(requestData)
            })

            return HttpService:JSONDecode(response.Body)
        end)

        if success and result.valid then
            statusLabel.Text = "Key validated! Loading script..."
            statusLabel.TextColor3 = Color3.fromRGB(100, 255, 100)
            wait(1)
            screenGui:Destroy()

            local scriptSuccess, scriptError = pcall(function()
                loadstring(result.script)()
            end)

            if not scriptSuccess then
                warn("Script execution error:", scriptError)
            end
        else
            statusLabel.Text = result.error or "Invalid key!"
            statusLabel.TextColor3 = Color3.fromRGB(255, 100, 100)
        end
    end)

    screenGui.Parent = playerGui
end

createKeyUI()

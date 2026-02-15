import { useState } from 'react'
import { Moon, Sun, Bell, Mail as MailIcon } from 'lucide-react'

export type Theme = 'light' | 'dark' | 'system'

export default function Settings() {
  const [theme, setTheme] = useState<Theme>('system')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [issueAssigned, setIssueAssigned] = useState(true)
  const [issueUpdated, setIssueUpdated] = useState(true)
  const [commentMentions, setCommentMentions] = useState(true)
  const [sprintUpdates, setSprintUpdates] = useState(true)

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    if (newTheme === 'system') {
      localStorage.removeItem('theme')
    } else {
      localStorage.setItem('theme', newTheme)
    }
    document.documentElement.classList.remove('light', 'dark')
    if (newTheme !== 'system') {
      document.documentElement.classList.add(newTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.add('light')
    }
  }

  const handleSaveSettings = () => {
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences and notifications</p>
      </div>

      <div className="space-y-6">
        {/* Appearance */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Theme</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    theme === 'light' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className="h-6 w-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Light</span>
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    theme === 'dark' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className="h-6 w-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">Dark</span>
                </button>

                <button
                  onClick={() => handleThemeChange('system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors ${
                    theme === 'system' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-xl">💻</span>
                  <span className="text-sm font-medium text-foreground">System</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex items-start gap-3">
                <MailIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Issue Assigned</p>
                <p className="text-xs text-muted-foreground">When someone assigns you to an issue</p>
              </div>
              <button
                onClick={() => setIssueAssigned(!issueAssigned)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  issueAssigned ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    issueAssigned ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Issue Updated</p>
                <p className="text-xs text-muted-foreground">When an issue you're working on changes</p>
              </div>
              <button
                onClick={() => setIssueUpdated(!issueUpdated)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  issueUpdated ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    issueUpdated ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border">
              <div>
                <p className="text-sm font-medium text-foreground">Comment Mentions</p>
                <p className="text-xs text-muted-foreground">When someone mentions you in a comment</p>
              </div>
              <button
                onClick={() => setCommentMentions(!commentMentions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  commentMentions ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    commentMentions ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Sprint Updates</p>
                <p className="text-xs text-muted-foreground">When sprints are created or completed</p>
              </div>
              <button
                onClick={() => setSprintUpdates(!sprintUpdates)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  sprintUpdates ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    sprintUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveSettings}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

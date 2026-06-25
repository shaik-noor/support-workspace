import * as React from "react"
import { Bell, ShieldAlert, Plus, ToggleLeft, ToggleRight, Trash2, Send, Save } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function AlertsPage() {
  const [rules, setRules] = React.useState([
    {
      id: 1,
      name: "API 5xx Server Errors Spike",
      level: "ERROR",
      pattern: "status: 500",
      channel: "#ops-alerts (Slack)",
      severity: "CRITICAL",
      active: true,
    },
    {
      id: 2,
      name: "Unauthorized Access Denied",
      level: "WARNING",
      pattern: "401 unauthorized",
      channel: "email (ops-security@)",
      severity: "HIGH",
      active: true,
    },
    {
      id: 3,
      name: "Database Write Latency",
      level: "WARNING",
      pattern: "slow query > 500ms",
      channel: "PagerDuty (on-call)",
      severity: "MEDIUM",
      active: false,
    },
  ])

  // Form states
  const [newRuleName, setNewRuleName] = React.useState("")
  const [newRuleLevel, setNewRuleLevel] = React.useState("ERROR")
  const [newRulePattern, setNewRulePattern] = React.useState("")
  const [newRuleChannel, setNewRuleChannel] = React.useState("#ops-alerts (Slack)")
  const [newRuleSeverity, setNewRuleSeverity] = React.useState("CRITICAL")

  const handleToggle = (id: number) => {
    setRules((curr) =>
      curr.map((rule) => (rule.id === id ? { ...rule, active: !rule.active } : rule))
    )
  }

  const handleDelete = (id: number) => {
    setRules((curr) => curr.filter((rule) => rule.id !== id))
  }

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleName.trim()) return

    const newRule = {
      id: Date.now(),
      name: newRuleName,
      level: newRuleLevel,
      pattern: newRulePattern || "*",
      channel: newRuleChannel,
      severity: newRuleSeverity,
      active: true,
    }

    setRules((curr) => [...curr, newRule])
    setNewRuleName("")
    setNewRulePattern("")
  }

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      case "HIGH":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20"
      case "MEDIUM":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
    }
  }

  const mockTriggeredAlerts = [
    { time: "2026-06-25 15:42:01", rule: "API 5xx Server Errors Spike", log: "ERROR [gateway] status: 500 upstream connection refused" },
    { time: "2026-06-25 13:10:14", rule: "Unauthorized Access Denied", log: "WARNING [auth] 401 unauthorized attempt from 192.168.1.105" },
  ]

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alerting & Incident Dispatcher</h1>
        <p className="text-muted-foreground text-sm">
          Define triggers for log anomaly matching, level filters, and route metrics notification channels.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Rules List (Left/Middle) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Configured Alert Rules ({rules.length})
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect and enable/disable automated rules for incoming log analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {rules.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No alert rules defined. Create one below.
                </div>
              ) : (
                rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-muted/20 gap-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{rule.name}</span>
                        <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Match Level: <span className="font-mono bg-muted px-1 rounded">{rule.level}</span></p>
                        <p>Pattern match: <span className="font-mono bg-muted px-1 rounded">"{rule.pattern}"</span></p>
                        <p>Dispatch to: <span className="font-semibold text-foreground">{rule.channel}</span></p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleToggle(rule.id)}
                        className="text-primary hover:opacity-80 transition-opacity cursor-pointer"
                        title={rule.active ? "Disable rule" : "Enable rule"}
                      >
                        {rule.active ? (
                          <ToggleRight className="h-7 w-7 text-primary" />
                        ) : (
                          <ToggleLeft className="h-7 w-7 text-zinc-400" />
                        )}
                      </button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rule.id)}
                        className="text-destructive hover:bg-destructive/10 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Trigger history */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-4 w-4" /> Recent Triggered Incidents (Simulation)
              </CardTitle>
              <CardDescription className="text-xs">
                History of recently fired alert conditions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTriggeredAlerts.map((alert, idx) => (
                <div key={idx} className="p-3 border border-red-500/20 bg-red-500/5 rounded-md space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-red-500">{alert.rule}</span>
                    <span className="font-mono text-zinc-500">{alert.time}</span>
                  </div>
                  <p className="font-mono text-xs text-zinc-300 bg-black/90 p-2 rounded overflow-x-auto">
                    {alert.log}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Create Rule Panel (Right) */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Plus className="h-4 w-4 text-primary" /> New Alerting Rule
              </CardTitle>
              <CardDescription className="text-xs">
                Add an automated rule matching query expressions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateRule} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Rule Name</label>
                  <Input
                    placeholder="e.g. Memory Breach"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Match Log Level</label>
                  <Select value={newRuleLevel} onValueChange={setNewRuleLevel}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">INFO</SelectItem>
                      <SelectItem value="WARNING">WARNING</SelectItem>
                      <SelectItem value="ERROR">ERROR</SelectItem>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Search Pattern (Substring)</label>
                  <Input
                    placeholder="e.g. OutOfMemory"
                    value={newRulePattern}
                    onChange={(e) => setNewRulePattern(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Notification Webhook Channel</label>
                  <Input
                    placeholder="e.g. #ops-channel"
                    value={newRuleChannel}
                    onChange={(e) => setNewRuleChannel(e.target.value)}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Severity Level</label>
                  <Select value={newRuleSeverity} onValueChange={setNewRuleSeverity}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                      <SelectItem value="HIGH">HIGH</SelectItem>
                      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full text-xs font-medium cursor-pointer">
                  <Save className="h-4 w-4 mr-1.5" /> Save Alert Rule
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

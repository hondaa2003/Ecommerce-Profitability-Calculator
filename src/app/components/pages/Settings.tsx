import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { InfoTip } from "../InfoTip";
import { tips } from "../glossary";
import { Plug, Plus } from "lucide-react";

export function Settings() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-slate-900" style={{ fontSize: "1.5rem", fontWeight: 600 }}>Settings</h1>
        <p className="text-slate-500 text-sm">Manage your store, team, integrations, and billing.</p>
      </div>

      <Tabs defaultValue="store">
        <TabsList className="bg-white border border-slate-200">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="store" className="mt-4 space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">Store Information</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-700 mb-1">Store Name</Label>
                <Input defaultValue="Fares Mart" />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">Store URL</Label>
                <Input defaultValue="faresmart.ae" />
              </div>
              <div>
                <Label className="text-slate-700 mb-1">Currency</Label>
                <Select defaultValue="AED">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                    <SelectItem value="SAR">SAR — Saudi Riyal</SelectItem>
                    <SelectItem value="KWD">KWD — Kuwaiti Dinar</SelectItem>
                    <SelectItem value="EGP">EGP — Egyptian Pound</SelectItem>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">VAT (%) <InfoTip tipKey="vat" /></Label>
                <Input type="number" defaultValue={5} />
              </div>
            </div>
          </Card>

          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-4">Default Costs</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">Shipping <InfoTip tipKey="shipping" /></Label>
                <Input type="number" defaultValue={18} />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">COD Fee <InfoTip tipKey="cod" /></Label>
                <Input type="number" defaultValue={8} />
              </div>
              <div>
                <Label className="text-slate-700 mb-1 flex items-center gap-1">Packaging <InfoTip tipKey="packaging" /></Label>
                <Input type="number" defaultValue={4} />
              </div>
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
              <div>
                <div className="text-slate-900 text-sm">Apply defaults to new products</div>
                <div className="text-xs text-slate-500">Products will be pre-filled with these values.</div>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-900">Team Members</div>
              <Button className="bg-blue-700 hover:bg-blue-800"><Plus className="w-4 h-4 mr-1" /> Invite</Button>
            </div>
            <div className="space-y-3">
              {[
                { name: "Ahmed Fares", role: "Owner", email: "ahmed@faresmart.ae" },
                { name: "Layla R.", role: "Media Buyer", email: "layla@faresmart.ae" },
                { name: "Karim H.", role: "Analyst", email: "karim@faresmart.ae" },
              ].map((m) => (
                <div key={m.email} className="flex items-center justify-between p-3 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9"><AvatarFallback className="bg-blue-700 text-white text-xs">{m.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback></Avatar>
                    <div>
                      <div className="text-slate-900 text-sm">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select defaultValue={m.role}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Media Buyer">Media Buyer</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-1">Store APIs</div>
            <div className="text-xs text-slate-500 mb-4">Connect your storefront for automatic order sync.</div>
            <div className="grid md:grid-cols-3 gap-3">
              {["Shopify", "Salla", "Zid"].map((s) => (
                <IntegrationCard key={s} name={s} desc="Sync products, orders, and customers" />
              ))}
            </div>
          </Card>
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="text-slate-900 mb-1">Ad Platform APIs</div>
            <div className="text-xs text-slate-500 mb-4">Pull spend, ROAS, and campaign data automatically.</div>
            <div className="grid md:grid-cols-3 gap-3">
              {["Meta Ads", "TikTok Ads", "Google Ads"].map((s) => (
                <IntegrationCard key={s} name={s} desc="Auto-sync spend and ROAS" />
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4">
          <Card className="p-5 rounded-2xl border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-slate-900">Subscription</div>
                <div className="text-xs text-slate-500">You are on the Pro plan trial.</div>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50">Pro · Trial</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4 rounded-xl border-slate-200">
                <div className="text-slate-900">Basic</div>
                <div className="text-2xl mt-1">$19<span className="text-sm text-slate-500">/mo</span></div>
                <Button variant="outline" className="w-full mt-3 border-slate-200">Downgrade</Button>
              </Card>
              <Card className="p-4 rounded-xl border-blue-700 ring-2 ring-blue-100">
                <div className="text-slate-900">Pro · Current</div>
                <div className="text-2xl mt-1">$49<span className="text-sm text-slate-500">/mo</span></div>
                <Button className="w-full mt-3 bg-blue-700 hover:bg-blue-800">Manage</Button>
              </Card>
              <Card className="p-4 rounded-xl border-slate-200">
                <div className="text-slate-900">Agency</div>
                <div className="text-2xl mt-1">$149<span className="text-sm text-slate-500">/mo</span></div>
                <Button variant="outline" className="w-full mt-3 border-slate-200">Upgrade</Button>
              </Card>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          <Plug className="w-4 h-4" />
        </div>
        <div>
          <div className="text-slate-900 text-sm">{name}</div>
          <div className="text-xs text-slate-500">{desc}</div>
        </div>
      </div>
      <Button variant="outline" className="w-full border-slate-200">Connect</Button>
      <div className="text-[10px] text-orange-600 mt-2">Available soon</div>
    </div>
  );
}

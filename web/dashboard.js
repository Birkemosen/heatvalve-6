(()=>{var Ce={},ie={};function h(e){return Ce[e.tag]=e,e}function N(e,t){let r=Ce[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let n=r.state(t||{});for(let c in n)o[c]=n[c]}if(r.methods)for(let n in r.methods)o[n]=r.methods[n];let a=document.createElement("div");a.innerHTML=r.render(o);let i=a.firstElementChild;return r.onMount&&r.onMount(o,i),i}function m(e,t){(ie[e]||(ie[e]=[])).push(t)}function D(e){let t=ie[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var R=6,st=28,le=Object.create(null),it=dt(),F={section:"overview",selectedZone:1,live:!1,pendingWrites:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:lt(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:it,manualMode:!1};function lt(){let e=Object.create(null);for(let t=1;t<=R;t++)e[t]=[];return e}function dt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<R;)e.push("");return e.slice(0,R)}function ct(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(F.zoneNames))}catch(e){}}function A(e){return"$dashboard:"+e}function Ee(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function f(e){let t=le[e];return t?t.v!=null?t.v:t.value!=null?t.value:Ee(t.s!=null?t.s:t.state):null}function x(e){let t=le[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function d(e,t){let r=le[e];r||(r=le[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);D(e),e==="text_sensor-firmware_version"&&B("firmwareVersion",x(e)||"")}function _(e,t){m(A(e),t)}function w(e){return F[e]}function B(e,t){F[e]=t,D(A(e))}function Me(e){F.section!==e&&(F.section=e,D(A("section")))}function Le(e){let t=Math.max(1,Math.min(R,Number(e)||1));F.selectedZone!==t&&(F.selectedZone=t,D(A("selectedZone")))}function W(e){let t=!!e;F.live!==t&&(F.live=t,D(A("live")))}function De(){F.pendingWrites+=1,D(A("pendingWrites"))}function xe(){F.pendingWrites=Math.max(0,F.pendingWrites-1),D(A("pendingWrites"))}function Ae(e,t){let r=Math.max(1,Math.min(R,Number(e)||1))-1;F.zoneNames[r]=String(t||"").trim(),ct(),D(A("zoneNames"))}function P(e){return F.zoneNames[Math.max(1,Math.min(R,Number(e)||1))-1]||""}function V(e){let t=Math.max(1,Math.min(R,Number(e)||1)),r=P(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function j(e){F.i2cResult=e||"No scan has been run yet.",D(A("i2cResult"))}function k(e,t){let r={time:pt(),msg:String(e||"")};for(F.activityLog.push(r);F.activityLog.length>60;)F.activityLog.shift();if(t>=1&&t<=R){let o=F.zoneLog[t];for(o.push(r);o.length>8;)o.shift();D(A("zoneLog:"+t))}D(A("activityLog"))}function Oe(e){return e>=1&&e<=R?F.zoneLog[e]:F.activityLog}function ve(e,t){let r=F[e];if(!Array.isArray(r))return;let o=Ee(t);if(o!=null){for(r.push(o);r.length>st;)r.shift();D(A(e))}}function K(e){let t=Date.now();if(!e&&t-F.lastHistoryAt<3200)return;F.lastHistoryAt=t;let r=0,o=0;for(let a=1;a<=R;a++){let i=f("sensor-zone_"+a+"_valve_pct");i!=null&&(r+=i,o+=1)}ve("historyFlow",f("sensor-manifold_flow_temperature")),ve("historyReturn",f("sensor-manifold_return_temperature")),ve("historyDemand",o?r/o:0)}function pt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}var s={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},l={flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct"};var E=6,mt=8,Te=null,ee=0,v={temp:new Float32Array(E),setpoint:new Float32Array(E),valve:new Float32Array(E),enabled:new Uint8Array(E),driversEnabled:1,fault:0,manualMode:0};function ut(){v.manualMode=0,B("manualMode",!1);for(let e=0;e<E;e++){v.temp[e]=20.5+e*.4,v.setpoint[e]=21+e%3*.5,v.valve[e]=12+e*8,v.enabled[e]=e===4?0:1;let t=e+1;d(s.temp(t),{value:v.temp[e]}),d(s.setpoint(t),{value:v.setpoint[e]}),d(s.valve(t),{value:v.valve[e]}),d(s.state(t),{state:v.valve[e]>5?"heating":"idle"}),d(s.enabled(t),{value:!!v.enabled[e],state:v.enabled[e]?"on":"off"}),d(s.probe(t),{state:"Probe "+t}),d(s.tempSource(t),{state:t%2?"Local Probe":"BLE Sensor"}),d(s.syncTo(t),{state:"None"}),d(s.pipeType(t),{state:"PEX 16mm"}),d(s.area(t),{value:8+t*3.5}),d(s.spacing(t),{value:[150,200,150,100,200,150][e]}),d(s.zigbee(t),{state:"zone_"+t+"_mock_sensor"}),d(s.ble(t),{state:"AA:BB:CC:DD:EE:0"+t}),d(s.exteriorWalls(t),{state:["N","E","S","W","N,E","S,W"][e]})}for(let e=1;e<=mt;e++){let t=e<=E?e:E,r=v.temp[t-1]+(e>E?1:.1*e);d(s.probeTemp(e),{value:r})}d(l.flow,{value:34.1}),d(l.ret,{value:30.4}),d(l.uptime,{value:18*3600+720}),d(l.wifi,{value:-57}),d(l.drivers,{value:!0,state:"on"}),d(l.fault,{value:!1,state:"off"}),d(l.ip,{state:"192.168.1.86"}),d(l.ssid,{state:"MockLab"}),d(l.mac,{state:"D8:3B:DA:12:34:56"}),d(l.firmware,{state:"0.5.x-mock"}),d(l.manifoldFlowProbe,{state:"Probe 7"}),d(l.manifoldReturnProbe,{state:"Probe 8"}),d(l.manifoldType,{state:"NC (Normally Closed)"}),d(l.motorProfileDefault,{state:"HmIP VdMot"}),d(l.closeThresholdMultiplier,{value:1.8}),d(l.closeSlopeThreshold,{value:1}),d(l.closeSlopeCurrentFactor,{value:1.4}),d(l.openThresholdMultiplier,{value:1.8}),d(l.openSlopeThreshold,{value:.8}),d(l.openSlopeCurrentFactor,{value:1.3}),d(l.openRippleLimitFactor,{value:1}),d(l.genericRuntimeLimitSeconds,{value:45}),d(l.hmipRuntimeLimitSeconds,{value:40}),d(l.learnedFactorMinSamples,{value:3}),d(l.learnedFactorMaxDeviationPct,{value:12}),K(!0)}function gt(){ee+=1,d(l.uptime,{value:Number(Date.now()/1e3)|0}),d(l.wifi,{value:-55-Math.round((1+Math.sin(ee/4))*6)});let e=0,t=0,r=0;for(let i=0;i<E;i++){let n=i+1,c=!!v.enabled[i],p=v.temp[i],u=v.setpoint[i],b=c&&v.driversEnabled&&!v.manualMode&&p<u-.25;v.manualMode?v.valve[i]=Math.max(0,v.valve[i]):!c||!v.driversEnabled?v.valve[i]=Math.max(0,v.valve[i]-6):b?v.valve[i]=Math.min(100,v.valve[i]+7+n%3):v.valve[i]=Math.max(0,v.valve[i]-5);let g=b?.05+v.valve[i]/2200:-.03+v.valve[i]/3200;v.temp[i]=p+g+Math.sin((ee+n)/5)*.04,c&&v.valve[i]>0&&(e+=v.valve[i],t+=1,r=Math.max(r,v.valve[i])),d(s.temp(n),{value:v.temp[i]}),d(s.valve(n),{value:Math.round(v.valve[i])}),d(s.state(n),{state:c?b?"heating":"idle":"off"}),d(s.enabled(n),{value:c,state:c?"on":"off"}),d(s.probeTemp(n),{value:v.temp[i]+Math.sin((ee+n)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(ee/6)*.25,a=o-(t?2.1+e/Math.max(1,t*50):1.1);d(l.flow,{value:Number(o.toFixed(1))}),d(l.ret,{value:Number(a.toFixed(1))}),d(s.probeTemp(7),{value:Number((a-.4).toFixed(1))}),d(s.probeTemp(8),{value:Number((o+.2).toFixed(1))}),K(!0)}function Re(){Te||(ut(),W(!0),Te=setInterval(gt,1200))}function de(e){let t=new URL(e,"http://localhost"),r=t.pathname.split("/").filter(Boolean);if(r[0]==="zones"&&r[2]==="setpoint"){let o=Number(r[1]),a=Number(t.searchParams.get("setpoint_c"));o>=1&&o<=E&&!Number.isNaN(a)&&(v.setpoint[o-1]=a,d(s.setpoint(o),{value:a}),k("Zone "+o+" setpoint set to "+a.toFixed(1)+"\xB0C",o));return}if(r[0]==="zones"&&r[2]==="enabled"){let o=Number(r[1]),a=t.searchParams.get("enabled")==="true";o>=1&&o<=E&&(v.enabled[o-1]=a?1:0,d(s.enabled(o),{value:a,state:a?"on":"off"}),k("Zone "+o+(a?" enabled":" disabled"),o));return}if(r[0]==="drivers"&&r[1]==="enabled"){v.driversEnabled=t.searchParams.get("enabled")==="true"?1:0,d(l.drivers,{value:!!v.driversEnabled,state:v.driversEnabled?"on":"off"}),k(v.driversEnabled?"Motor drivers enabled":"Motor drivers disabled");return}if(r[0]==="manual_mode"){let o=t.searchParams.get("enabled")==="true";v.manualMode=o?1:0,B("manualMode",o);return}if(r[0]==="motors"&&r[2]==="target"){let o=Number(r[1]),a=Number(t.searchParams.get("value")||"0");o>=1&&o<=E&&!Number.isNaN(a)&&(d(s.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(a)))}),k("Motor "+o+" target set to "+a+"%",o));return}if(r[0]==="settings"){let o=t.searchParams.get("key")||"",a=t.searchParams.get("value")||"",i=Number(t.searchParams.get("zone")||"1");if(r[1]==="select"){o==="zone_probe"&&d(s.probe(i),{state:a}),o==="zone_temp_source"&&d(s.tempSource(i),{state:a}),o==="zone_sync_to"&&d(s.syncTo(i),{state:a}),o==="zone_pipe_type"&&d(s.pipeType(i),{state:a}),o==="manifold_type"&&d(l.manifoldType,{state:a}),o==="manifold_flow_probe"&&d(l.manifoldFlowProbe,{state:a}),o==="manifold_return_probe"&&d(l.manifoldReturnProbe,{state:a}),o==="motor_profile_default"&&d(l.motorProfileDefault,{state:a}),k("Setting updated: "+o+" = "+a,i);return}if(r[1]==="text"){o==="zone_zigbee_device"&&d(s.zigbee(i),{state:a}),o==="zone_ble_mac"&&d(s.ble(i),{state:a}),o==="zone_exterior_walls"&&d(s.exteriorWalls(i),{state:a||"None"}),k("Setting updated: "+o+" = "+a,i);return}if(r[1]==="number"){let n=Number(a);o==="zone_area_m2"&&!Number.isNaN(n)&&d(s.area(i),{value:n}),o==="zone_pipe_spacing_mm"&&!Number.isNaN(n)&&d(s.spacing(i),{value:n}),o==="close_threshold_multiplier"&&!Number.isNaN(n)&&d(l.closeThresholdMultiplier,{value:n}),o==="close_slope_threshold"&&!Number.isNaN(n)&&d(l.closeSlopeThreshold,{value:n}),o==="close_slope_current_factor"&&!Number.isNaN(n)&&d(l.closeSlopeCurrentFactor,{value:n}),o==="open_threshold_multiplier"&&!Number.isNaN(n)&&d(l.openThresholdMultiplier,{value:n}),o==="open_slope_threshold"&&!Number.isNaN(n)&&d(l.openSlopeThreshold,{value:n}),o==="open_slope_current_factor"&&!Number.isNaN(n)&&d(l.openSlopeCurrentFactor,{value:n}),o==="open_ripple_limit_factor"&&!Number.isNaN(n)&&d(l.openRippleLimitFactor,{value:n}),o==="generic_runtime_limit_seconds"&&!Number.isNaN(n)&&d(l.genericRuntimeLimitSeconds,{value:n}),o==="hmip_runtime_limit_seconds"&&!Number.isNaN(n)&&d(l.hmipRuntimeLimitSeconds,{value:n}),o==="learned_factor_min_samples"&&!Number.isNaN(n)&&d(l.learnedFactorMinSamples,{value:n}),o==="learned_factor_max_deviation_pct"&&!Number.isNaN(n)&&d(l.learnedFactorMaxDeviationPct,{value:n}),k("Setting updated: "+o+" = "+a,i);return}}if(r[0]==="commands"){let o=t.searchParams.get("command"),a=Number(t.searchParams.get("zone")||"0");if(o==="i2c_scan"){j(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),k("I2C scan complete");return}if(o==="reset_1wire_probe_map_reboot"||o==="dump_1wire_probe_diagnostics"||o==="restart"){k("Command executed: "+o);return}if(o==="open_motor_timed"&&a>=1&&a<=E){let i=Number(t.searchParams.get("duration_ms")||"10000");k("Motor "+a+" open timed for "+i+"ms",a);return}if(o==="close_motor_timed"&&a>=1&&a<=E){let i=Number(t.searchParams.get("duration_ms")||"10000");k("Motor "+a+" close timed for "+i+"ms",a);return}if(o==="stop_motor"&&a>=1&&a<=E){k("Motor "+a+" stopped",a);return}if(o==="motor_reset_fault"&&a>=1&&a<=E){k("Motor "+a+" fault reset",a);return}if(o==="motor_reset_learned_factors"&&a>=1&&a<=E){k("Motor "+a+" learned factors reset",a);return}if(o==="motor_reset_and_relearn"&&a>=1&&a<=E){k("Motor "+a+" reset and relearn started",a);return}}}window.__hv6_mock={setSetpoint(e,t){de("/zones/"+e+"/setpoint?setpoint_c="+t)},toggleZone(e){let t=!v.enabled[e-1];de("/zones/"+e+"/enabled?enabled="+(t?"true":"false"))}};var U,he=null;function bt(e){if(!(!e||typeof e!="object")){for(let t in e)d(t,e[t]);K(!1)}}function ft(e){let t=null;try{t=JSON.parse(e.data)}catch(r){return}if(!(!t||!t.type)){if(t.type==="state"){bt(t.data);return}if(t.type==="log"){let r=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!r)return;k(r),String(r).indexOf("I2C_SCAN:")!==-1&&j(String(r))}}}function vt(){he||(he=setTimeout(()=>{he=null,ye()},2500))}function ye(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Re();return}U&&U.close(),U=new EventSource("/api/hv6/v1/events"),U.onopen=()=>W(!0),U.onmessage=ft,U.onerror=function(){W(!1),vt()}}var qe=Object.create(null);function y(e,t){if(qe[e])return;qe[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function M(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function G(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function ce(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function Pe(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var xt=`
.topbar {
  position: static;
  margin-bottom: 14px;
  padding: 12px;
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  background: var(--panel-bg-vibrant);
  box-shadow: var(--panel-shadow);
  display: grid;
  gap: 10px;
}

.topbar-head {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
}

.top-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.side-brand {
  color: var(--accent);
  font-family: var(--mono);
  font-size: 1.02rem;
  font-weight: 800;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  white-space: nowrap;
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  color: var(--accent);
  font-size: .66rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
}

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: linear-gradient(180deg, rgba(28,54,95,.54), rgba(19,38,70,.46));
  border-radius: 11px;
  padding: 10px 12px;
  font-size: .78rem;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: .8px;
  transition: .2s ease;
}

.menu-link:hover {
  color: var(--text-strong);
  background: linear-gradient(180deg, rgba(42,76,132,.64), rgba(28,54,100,.54));
  border-color: rgba(120,168,255,.52);
}

.menu-link.active {
  color: var(--text-on-accent);
  border-color: var(--accent);
  background: var(--accent);
}

.top-meta {
  display: grid;
  justify-items: end;
  row-gap: 4px;
  color: var(--muted);
  font-size: .74rem;
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.meta-chip {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  height: 34px;
  padding: 4px 10px;
  border-radius: 14px;
  border: 1px solid rgba(120,168,255,.32);
  background: linear-gradient(180deg, rgba(31,61,105,.52), rgba(18,36,68,.42));
}

.meta-chip-label {
  text-transform: uppercase;
  letter-spacing: .6px;
  font-size: 9px;
  font-weight: 700;
  line-height: 1;
  color: var(--text-secondary);
}

.meta-chip-value {
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  color: var(--text-strong);
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: rgba(121,209,126,.25);
  background: linear-gradient(180deg, rgba(20,52,34,.46), rgba(13,39,27,.36));
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: rgba(238,161,17,.35);
  background: linear-gradient(180deg, rgba(83,56,20,.46), rgba(58,37,12,.36));
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,168,255,.24);
  background: linear-gradient(180deg, rgba(31,61,105,.34), rgba(18,36,68,.28));
}

.brand-fw {
  min-height: 12px;
  font-size: .62rem;
  letter-spacing: .7px;
  color: var(--text-secondary);
  font-family: var(--mono);
  text-transform: uppercase;
}

.top-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--state-disabled);
  transition: .2s ease;
}

.top-dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  .top-brand { justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .top-meta { justify-items: center; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;y("hv6-header",xt);var ht=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">HeatValve-6</div>
          <div class="mode-pill" id="hdr-mode"></div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview">Dashboard</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="diagnostics">Diagnostics</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
      </nav>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,rr=h({tag:"hv6-header",render:ht,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),a=t.querySelector("#hdr-sync"),i=t.querySelector("#hdr-up"),n=t.querySelector("#hdr-wifi"),c=t.querySelector("#hdr-fw"),p=t.querySelectorAll(".menu-link");function u(){let g=w("section");p.forEach(z=>{z.classList.toggle("active",z.getAttribute("data-section")===g)})}function b(){let g=w("live"),z=w("pendingWrites"),C=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":g?"Live":"Offline";r.textContent=C,o.classList.toggle("on",!!g),a.textContent=z>0?"Saving...":g?"Synced":"Offline";let S=z>0?"saving":g?"synced":"offline";a.className="meta-chip meta-chip-state "+S,i.textContent=ce(f(l.uptime)),n.textContent=Pe(f(l.wifi));let L=w("firmwareVersion")||x(l.firmware);c.textContent=L?"FW "+L:""}p.forEach(g=>{g.addEventListener("click",z=>{z.preventDefault(),Me(g.getAttribute("data-section"))})}),_("section",u),_("live",b),_("pendingWrites",b),_("firmwareVersion",b),m(l.uptime,b),m(l.wifi,b),m(l.firmware,b),u(),b()}});var yt="/api/hv6/v1";function zt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function O(e){if(De(),zt())try{return de(e),Promise.resolve({ok:!0})}finally{xe()}return fetch(yt+e,{method:"POST"}).finally(()=>{xe()})}function ze(e,t){return d(s.setpoint(e),{value:t}),O("/zones/"+e+"/setpoint?setpoint_c="+encodeURIComponent(t))}function Ie(e,t){return d(s.enabled(e),{state:t?"on":"off",value:t}),O("/zones/"+e+"/enabled?enabled="+(t?"true":"false"))}function Ze(e){return d(l.drivers,{state:e?"on":"off",value:e}),O("/drivers/enabled?enabled="+(e?"true":"false"))}function T(e,t,r=""){let o=t?"&zone="+t:"";return O("/commands?command="+encodeURIComponent(e)+o+r)}function He(){return j("Scanning I2C bus..."),k("I2C scan started"),T("i2c_scan")}var wt={zone_probe:e=>s.probe(e),zone_temp_source:e=>s.tempSource(e),zone_sync_to:e=>s.syncTo(e),zone_pipe_type:e=>s.pipeType(e)},_t={zone_zigbee_device:e=>s.zigbee(e),zone_ble_mac:e=>s.ble(e),zone_exterior_walls:e=>s.exteriorWalls(e)},St={zone_area_m2:e=>s.area(e),zone_pipe_spacing_mm:e=>s.spacing(e)},kt={manifold_type:l.manifoldType,manifold_flow_probe:l.manifoldFlowProbe,manifold_return_probe:l.manifoldReturnProbe,motor_profile_default:l.motorProfileDefault},Ft={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct};function $(e,t,r){let o=wt[t];return o&&d(o(e),{state:r}),O("/settings/select?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function te(e,t,r){let o=_t[t];return o&&d(o(e),{state:r}),O("/settings/text?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function we(e,t,r){let o=Number(r),a=St[t];return a&&!Number.isNaN(o)&&d(a(e),{value:o}),O("/settings/number?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function X(e,t){let r=kt[e];return r&&d(r,{state:t}),O("/settings/select?key="+encodeURIComponent(e)+"&value="+encodeURIComponent(t))}function oe(e,t){let r=Number(t),o=Ft[e];return o&&!Number.isNaN(r)&&d(o,{value:r}),O("/settings/number?key="+encodeURIComponent(e)+"&value="+encodeURIComponent(t))}function Be(e,t){let r=Number(t);if(Number.isNaN(r))return O("/motors/"+e+"/target?value=0");let o=Math.max(0,Math.min(100,Math.round(r)));return d(s.motorTarget(e),{value:o}),k("Motor "+e+" target set to "+o+"%",e),O("/motors/"+e+"/target?value="+o)}function We(e,t=1e4){return k("Motor "+e+" open for "+t+"ms",e),T("open_motor_timed",e,"&duration_ms="+t)}function Ve(e,t=1e4){return k("Motor "+e+" close for "+t+"ms",e),T("close_motor_timed",e,"&duration_ms="+t)}function _e(e){return k("Motor "+e+" stopped",e),T("stop_motor",e)}function Se(e){return B("manualMode",!!e),k(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),O("/manual_mode?enabled="+(e?"true":"false"))}function je(e){return k("Motor "+e+" fault reset",e),T("motor_reset_fault",e)}function Ue(e){return k("Motor "+e+" learned factors reset",e),T("motor_reset_learned_factors",e)}function Ge(e){return k("Motor "+e+" reset and relearn started",e),T("motor_reset_and_relearn",e)}var Nt=`
.status-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  min-width: 220px;
}
.status-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.status-card .st {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-strong);
}
.status-card .st td {
  padding: 6px 0;
  font-size: 1rem;
}
.status-card .st tr:not(:last-child) td {
  border-bottom: 1px solid rgba(255,255,255,.08);
}
.status-card .drv-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.status-card .sw {
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: var(--state-danger);
  border: 1px solid rgba(255,100,100,.3);
  cursor: pointer;
  margin-left: 6px;
  position: relative;
  flex-shrink: 0;
  transition: background .2s ease, border-color .2s ease;
}
.status-card .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: .2s ease;
}
.status-card .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.status-card .sw.on::after {
  transform: translateX(16px);
  background: #0f213c;
}
.status-card .sw.off {
  background: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}
.status-card .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(120,168,255,.35);
  transition: .2s ease;
  flex-shrink: 0;
  display: inline-block;
}
.status-card .dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(83,168,255,.55);
}
`;y("status-card",Nt);var Ct=e=>`
  <div class="card status-card">
    <div class="card-title">Status</div>
    <table class="st">
      <tr>
        <td>Motor Drivers</td>
        <td>
          <div class="drv-toggle">
            <span id="sys-drv">${e.motorDrivers}</span>
            <div class="sw ${e.motorDriversOn?"on":"off"}" id="sw-drv"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td>Motor Fault</td>
        <td id="sys-fault">${e.motorFault}</td>
      </tr>
      <tr>
        <td>Connection</td>
        <td id="sys-conn"><span class="dot ${e.connOn?"on":""}" id="sys-dot"></span></td>
      </tr>
    </table>
  </div>
`,gr=h({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Ct,methods:{update(e){this.motorDriversOn=String(x(l.drivers)).toLowerCase()==="on",this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=String(x(l.fault)).toLowerCase()==="on"?"FAULT":"OK",this.connOn=w("live")===!0;let t=e.querySelector("#sys-drv");t.textContent=this.motorDrivers,t.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let r=e.querySelector("#sys-fault"),o=this.motorFault==="FAULT";r.textContent=this.motorFault,r.style.color=o?"var(--state-danger)":"var(--state-ok)",e.querySelector("#sys-dot").classList.toggle("on",this.connOn),e.querySelector("#sw-drv").className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r=()=>e.update(t);m(l.drivers,r),m(l.fault,r),_("live",r),t.querySelector("#sw-drv").onclick=()=>{Ze(!e.motorDriversOn)},r()}});var Et=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.connectivity-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 10px 0; font-size: .88rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 48%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;y("connectivity-card",Et);var Mt=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,zr=h({tag:"connectivity-card",render:Mt,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),i=t.querySelector(".cc-up");function n(){r.textContent=x(l.ip)||"---",o.textContent=x(l.ssid)||"---",a.textContent=x(l.mac)||"---",i.textContent=ce(f(l.uptime))}m(l.ip,n),m(l.ssid,n),m(l.mac,n),m(l.uptime,n),n()}});var Lt=`
.graph-widgets {
  display: grid;
  gap: 12px;
}

.graph-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
}

.graph-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.graph-head strong {
  color: var(--text-strong);
  font-size: .82rem;
}

.graph-card svg {
  width: 100%;
  height: 56px;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(83,168,255,.12), rgba(15,33,60,.4));
}
`;y("graph-widgets",Lt);var Dt=()=>`
  <div class="graph-widgets">
    <div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div>
    <div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div>
  </div>
`;function $e(e,t,r,o){if(!e.length)return"";let a=Math.min.apply(null,e),i=Math.max.apply(null,e),n=Math.max(.001,i-a),c=e.length>1?(t-o*2)/(e.length-1):0,p="";for(let u=0;u<e.length;u++){let b=o+c*u,g=r-o-(e[u]-a)/n*(r-o*2);p+=(u?" L ":"M ")+b.toFixed(2)+" "+g.toFixed(2)}return p}function Xe(e,t,r,o,a){e.innerHTML="";let i=$e(t,220,56,5);if(i){let c=document.createElementNS("http://www.w3.org/2000/svg","path");c.setAttribute("d",i),c.setAttribute("fill","none"),c.setAttribute("stroke",r),c.setAttribute("stroke-width","2.2"),c.setAttribute("stroke-linecap","round"),e.appendChild(c)}let n=o&&o.length?$e(o,220,56,5):"";if(n){let c=document.createElementNS("http://www.w3.org/2000/svg","path");c.setAttribute("d",n),c.setAttribute("fill","none"),c.setAttribute("stroke",a),c.setAttribute("stroke-width","2"),c.setAttribute("stroke-linecap","round"),e.appendChild(c)}}var At="var(--accent)",Ot="var(--blue)",Tt="var(--blue)",Fr=h({tag:"graph-widgets",render:Dt,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),i=t.querySelector(".gw-demand");function n(){let c=w("historyFlow"),p=w("historyReturn"),u=w("historyDemand"),b=c.length?c[c.length-1]:null,g=p.length?p[p.length-1]:null,z=u.length?u[u.length-1]:null;r.textContent=b!=null&&g!=null?(b-g).toFixed(1)+" C":"---",o.textContent=z!=null?Math.round(z)+"%":"---",Xe(a,c,At,p,Ot),Xe(i,u,Tt)}_("historyFlow",n),_("historyReturn",n),_("historyDemand",n),n()}});var Rt=`
.zone-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 8px;
    margin-bottom: 14px;
}

@media (max-width: 720px) {
    .zone-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 560px) {
    .zone-grid { grid-template-columns: repeat(2, 1fr); }
}
`;y("zone-grid",Rt);var qt=()=>'<div class="zone-grid"></div>',Mr=h({tag:"zone-grid",render:qt,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(N("zone-card",{zone:r}))}});var Pt=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,168,255,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(83,168,255,.42);
	border-left-color: rgba(83,168,255,.7);
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(238,161,17,.44);
	border-left-color: rgba(238,161,17,.84);
	background: linear-gradient(180deg, rgba(238,161,17,.12), rgba(238,161,17,.04));
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,168,255,.35);
}

.zone-card.zs-heating { border-left-color: #EEA111; }
.zone-card.zs-idle { border-left-color: #53A8FF; }
.zone-card.zs-off { border-left-color: rgba(120,168,255,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,168,255,.4);
}

.zone-card .zc-state-label {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
}

.zone-card .zc-zone-name {
	font-size: 14px;
	font-weight: 800;
	line-height: 1;
	color: var(--text-strong);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-friendly {
	font-size: 12px;
	font-weight: 600;
	line-height: 1.1;
	color: var(--text-secondary);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}
`;y("zone-card",Pt);var It=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${V(e.zone)}</div>
		<div class="zc-friendly">${P(e.zone)||M(null)}</div>
	</div>
`,qr=h({tag:"zone-card",state:e=>({zone:e.zone}),render:It,onMount(e,t){let r=t.querySelector(".zc-state-label"),o=t.querySelector(".zc-dot"),a=t.querySelector(".zc-zone-name"),i=t.querySelector(".zc-friendly");function n(){let c=e.zone,p=String(x(s.enabled(c))).toLowerCase()==="on",u=String(x(s.state(c))||"").toUpperCase()||"OFF",b=M(f(s.temp(c))),g=w("selectedZone")===c;a.textContent=V(c),i.textContent=P(c)||b,r.textContent=p?u:"OFF";let z=p?u:"OFF",C=z==="HEATING"?"#f2c77b":z==="IDLE"?"#79d17e":z==="FAULT"?"#ff7676":"#7D8BA7",S=z==="HEATING"?"#EEA111":z==="IDLE"?"#79d17e":z==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";r.style.color=C,o.style.background=S,o.style.boxShadow=z==="HEATING"?"0 0 5px rgba(238,161,17,.6)":z==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",g),t.classList.toggle("disabled",!p),t.classList.toggle("zs-heating",p&&u==="HEATING"),t.classList.toggle("zs-idle",p&&u!=="HEATING"),t.classList.toggle("zs-off",!p)}t.addEventListener("click",()=>{Le(e.zone)}),m(s.temp(e.zone),n),m(s.state(e.zone),n),m(s.enabled(e.zone),n),_("selectedZone",n),_("zoneNames",n),n()}});var Zt=`
.zone-detail {
  background: radial-gradient(700px 220px at 88% -42%, rgba(83,168,255,.22), transparent 62%), linear-gradient(180deg, rgba(20,44,79,.44), rgba(13,31,58,.38));
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.zone-detail .zd-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.zone-detail .zd-title {
  font-size: 1.12rem;
  font-weight: 700;
}

.zone-detail .zd-badge {
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .8px;
  background: rgba(83,168,255,.22);
  color: var(--text-secondary);
  border: 1px solid transparent;
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(238,161,17,.18);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.32);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(121,209,126,.14);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.26);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.18);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.32);
}

.zone-detail .zd-control {
  border: 1px solid var(--control-border);
  border-radius: 14px;
  padding: 14px;
  background: linear-gradient(180deg, rgba(83,168,255,.16), rgba(83,168,255,.06));
  margin-bottom: 12px;
}

.zone-detail .zd-kicker {
  font-size: .72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-secondary);
  font-weight: 700;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  margin-top: 4px;
  color: var(--accent);
}

.zone-detail .zd-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  margin-bottom: 8px;
}

.zone-detail .zd-toggle {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 600;
}

.zone-detail .zd-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.zone-detail .zd-stat {
  border: 1px solid var(--control-border);
  border-radius: 12px;
  padding: 10px;
  background: var(--control-bg);
}

.zone-detail .zd-stat span {
  display: block;
  font-size: .72rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.zone-detail .zd-stat strong {
  font-size: 1.1rem;
  font-weight: 800;
}

.zone-detail .spb {
  width: 48px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.45rem;
  transition: .18s ease;
}

.zone-detail .spb:hover {
  border-color: rgba(238,161,17,.55);
  color: var(--accent);
  background: rgba(238,161,17,.1);
}

.zone-detail .sw {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
}

.zone-detail .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: .2s ease;
}

.zone-detail .sw.on {
  background: var(--blue);
}

.zone-detail .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

@media (max-width: 560px) {
  .zone-detail .zd-grid { grid-template-columns: 1fr; }
}
`;y("zone-detail",Zt);var Ht=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${V(e.zone)}</div>
      <span class="zd-badge">---</span>
    </div>
    <div class="zd-control">
      <div class="zd-kicker">Target Temperature</div>
      <div class="zd-setpoint">---</div>
      <div class="zd-actions">
        <button class="spb btn-dec">\u2212</button>
        <button class="spb btn-inc">+</button>
      </div>
      <div class="zd-toggle"><span>Zone Enabled</span><div class="sw btn-toggle"></div></div>
    </div>
    <div class="zd-grid">
      <div class="zd-stat"><span>Current Temperature</span><strong class="zd-temp">---</strong></div>
      <div class="zd-stat"><span>Return Temperature</span><strong class="zd-ret">---</strong></div>
      <div class="zd-stat"><span>Valve Opening</span><strong class="zd-valve">---</strong></div>
    </div>
  </div>
`,jr=h({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Ht,methods:{update(e){let t=w("selectedZone"),r=String(x(s.state(t))||"").toUpperCase(),o=String(x(s.enabled(t))).toLowerCase()==="on";this.zone=t,e.dataset.zone=String(t),e.querySelector(".zd-title").textContent=V(t),e.querySelector(".zd-setpoint").textContent=M(f(s.setpoint(t))),e.querySelector(".zd-temp").textContent=M(f(s.temp(t))),e.querySelector(".zd-ret").textContent=M(f("sensor-manifold_return_temperature")),e.querySelector(".zd-valve").textContent=G(f(s.valve(t)));let a=e.querySelector(".zd-badge");a.textContent=o?r||"IDLE":"DISABLED";let i=o?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";a.className="zd-badge"+(i?" "+i:""),e.querySelector(".btn-toggle").classList.toggle("on",o)},incSetpoint(){let e=this.zone,t=f(s.setpoint(e))||20;ze(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=f(s.setpoint(e))||20;ze(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=String(x(s.enabled(e))).toLowerCase()==="on";Ie(e,!t)}},onMount(e,t){t.querySelector(".btn-inc").onclick=()=>e.incSetpoint(),t.querySelector(".btn-dec").onclick=()=>e.decSetpoint(),t.querySelector(".btn-toggle").onclick=()=>e.toggleEnabled();let r=()=>e.update(t);for(let o=1;o<=6;o++)m(s.temp(o),r),m(s.setpoint(o),r),m(s.valve(o),r),m(s.state(o),r),m(s.enabled(o),r);m("sensor-manifold_return_temperature",r),_("selectedZone",r),r()}});var Bt=`
.zone-sensor-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.zone-sensor-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-sensor-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.zone-sensor-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.zone-sensor-card .sel,
.zone-sensor-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-sensor-card .sel:focus,
.zone-sensor-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
`;y("zone-sensor-card",Bt);var Wt=()=>{let e="";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
    <div class="zone-sensor-card">
      <div class="card-title">Temperature Sensors / Connectivity</div>
      <div class="cfg-row">
        <span class="lbl">Zone Return Temperature Sensor</span>
        <select class="sel zs-probe">${e}</select>
      </div>
      <div class="cfg-row">
        <span class="lbl">Temperature Source</span>
        <select class="sel zs-source">
          <option>Local Probe</option>
          <option>Zigbee MQTT</option>
          <option>BLE Sensor</option>
        </select>
      </div>
      <div class="cfg-row zs-row-zigbee">
        <span class="lbl">Zigbee Device</span>
        <input class="txt zs-zigbee" maxlength="47" placeholder="zone_x_sensor">
      </div>
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE MAC</span>
        <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
        <select class="sel zs-sync"></select>
      </div>
    </div>
  `};function Vt(e,t){let r=e.value;e.innerHTML="";let o=document.createElement("option");o.value="None",o.textContent="None",e.appendChild(o);for(let a=1;a<=6;a++){if(a===t)continue;let i=document.createElement("option");i.value="Zone "+a,i.textContent="Zone "+a,e.appendChild(i)}e.value=r||"None"}var Qr=h({tag:"zone-sensor-card",render:Wt,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),a=t.querySelector(".zs-zigbee"),i=t.querySelector(".zs-ble"),n=t.querySelector(".zs-sync"),c=t.querySelector(".zs-row-zigbee"),p=t.querySelector(".zs-row-ble");function u(){return w("selectedZone")}function b(){let g=u();Vt(n,g);let z=x(s.probe(g)),C=x(s.tempSource(g))||"Local Probe",S=x(s.syncTo(g))||"None",L=x(s.zigbee(g))||"",J=x(s.ble(g))||"";z&&(r.value=z),o.value=C,n.value=S,document.activeElement!==a&&(a.value=L),document.activeElement!==i&&(i.value=J),c.style.display=C==="Zigbee MQTT"?"":"none",p.style.display=C==="BLE Sensor"?"":"none"}r.addEventListener("change",()=>{$(u(),"zone_probe",r.value)}),o.addEventListener("change",()=>{$(u(),"zone_temp_source",o.value)}),n.addEventListener("change",()=>{$(u(),"zone_sync_to",n.value)}),a.addEventListener("change",()=>{te(u(),"zone_zigbee_device",a.value)}),i.addEventListener("change",()=>{te(u(),"zone_ble_mac",i.value)}),_("selectedZone",b);for(let g=1;g<=6;g++)m(s.probe(g),b),m(s.tempSource(g),b),m(s.syncTo(g),b),m(s.zigbee(g),b),m(s.ble(g),b);b()}});var jt=`
.zone-room-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.zone-room-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-room-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.zone-room-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.zone-room-card .txt,
.zone-room-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.zone-room-card .txt:focus,
.zone-room-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.zone-room-card .wall-btn-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.zone-room-card .wall-btn {
  flex: 1;
  min-width: 46px;
  padding: 7px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .82rem;
  font-weight: 700;
  letter-spacing: .4px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease;
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;y("zone-room-card",jt);var Ut=()=>`
  <div class="zone-room-card">
    <div class="card-title">Room Settings</div>
    <div class="cfg-row"><span class="lbl">Friendly Name</span><input class="txt zr-friendly" maxlength="24" placeholder="e.g. Living Room"></div>
    <div class="cfg-row"><span class="lbl">Zone Area</span><input class="txt zr-area" type="number" min="1" step="0.1" placeholder="m2"></div>
    <div class="cfg-row"><span class="lbl">Pipe Spacing C-C</span><input class="txt zr-spacing" type="number" min="50" step="5" placeholder="200"></div>
    <div class="cfg-row"><span class="lbl">Pipe Type</span>
      <select class="sel zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select>
    </div>
    <div class="cfg-row">
      <span class="lbl">Exterior Walls</span>
      <div class="wall-btn-group">
        <button class="wall-btn" data-wall="None">None</button>
        <button class="wall-btn" data-wall="N">N</button>
        <button class="wall-btn" data-wall="S">S</button>
        <button class="wall-btn" data-wall="E">E</button>
        <button class="wall-btn" data-wall="W">W</button>
      </div>
    </div>
  </div>
`,na=h({tag:"zone-room-card",render:Ut,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),i=t.querySelector(".zr-pipe"),n=t.querySelectorAll(".wall-btn");function c(){return w("selectedZone")}function p(){let u=c();document.activeElement!==r&&(r.value=P(u)||""),document.activeElement!==o&&(o.value=f(s.area(u))!=null?String(f(s.area(u))):""),document.activeElement!==a&&(a.value=f(s.spacing(u))!=null?String(f(s.spacing(u))):""),i.value=x(s.pipeType(u))||"Unknown";let b=x(s.exteriorWalls(u))||"None",g=b==="None"?[]:b.split(",").filter(Boolean);n.forEach(z=>{let C=z.dataset.wall;z.classList.toggle("active",C==="None"?g.length===0:g.includes(C))})}r.addEventListener("change",()=>{Ae(c(),r.value)}),o.addEventListener("change",()=>{we(c(),"zone_area_m2",o.value)}),a.addEventListener("change",()=>{we(c(),"zone_pipe_spacing_mm",a.value||"200")}),i.addEventListener("change",()=>{$(c(),"zone_pipe_type",i.value)}),n.forEach(u=>{u.addEventListener("click",()=>{let b=u.dataset.wall,g=x(s.exteriorWalls(c()))||"None",z=g==="None"?[]:g.split(",").filter(Boolean);if(b==="None")z=[];else{let S=z.indexOf(b);S>=0?z.splice(S,1):z.push(b)}let C=["N","S","E","W"].filter(S=>z.includes(S));te(c(),"zone_exterior_walls",C.length?C.join(","):"None")})}),_("selectedZone",p),_("zoneNames",p);for(let u=1;u<=6;u++)m(s.area(u),p),m(s.spacing(u),p),m(s.pipeType(u),p),m(s.exteriorWalls(u),p);p()}});var Gt=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
}

.flow-svg {
  width: 100%;
  height: auto;
}

.flow-line {
  stroke-dasharray: 6;
  animation: flow 1s linear infinite;
}

@keyframes flow {
  from { stroke-dashoffset: 0; }
  to   { stroke-dashoffset: -12; }
}

.return-line {
  stroke: #42a5f5;
  stroke-width: 4;
}

.valve {
  transition: height 0.3s ease, y 0.3s ease, fill 0.3s ease;
}

.label {
  font-size: 10px;
  fill: #ccc;
}

.flow-temp,
.ret-temp {
  font-size: 10px;
  fill: #ccc;
}
`;y("flow-diagram",Gt);var H=6,Ke=[60,126,192,258,324,390],ue=225,Z=36,ae=160,pe=90,re=Z+ae,q=640,$t=11,Fe=6,Ne=24,ke=q+20,Ye=q+210,Je=q+328,Qe=q+420,et="#7D8BA7",tt="#6C7892",Xt="#8FCBFF",Yt="#BCDFFF",Jt="#E4D092",Qt="#F2B74C",Kt="#8FCBFF",eo="#D8E7FF",to="#7D8BA7",oo="#B7CBF0",ro="#6C7892",me="#A3B6D9",ao="#8EA4CD",no="#42A5F5",so="#66BB6A",io="#EF5350";function ge(e,t,r){var o=ue+(e-2.5)*$t,a=Ke[e],i=q-re,n=re+i*.33,c=re+i*.67;return"M"+re+" "+(o-t).toFixed(1)+" C"+n+" "+(o-t).toFixed(1)+" "+c+" "+(a-r).toFixed(1)+" "+q+" "+(a-r).toFixed(1)+" L"+q+" "+(a+r).toFixed(1)+" C"+c+" "+(a+r).toFixed(1)+" "+n+" "+(o+t).toFixed(1)+" "+re+" "+(o+t).toFixed(1)+"Z"}function lo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function co(e){let t=String(P(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function po(e,t){return t?e==null||Number.isNaN(e)?tt:e<.15?Xt:e<.4?Yt:e<.7?Jt:Qt:et}function mo(){var e=1160,t=460,r=ue-pe/2,o=Z,a=[];a.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),a.push("<defs>"),a.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),a.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),a.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var i=1;i<=H;i++)a.push('<linearGradient id="rg'+i+'" x1="0" y1="0" x2="1" y2="0">'),a.push('<stop id="rgs'+i+'" offset="0%" stop-color="#EEA111"/>'),a.push('<stop id="rga'+i+'" offset="100%" stop-color="#53A8FF"/>'),a.push("</linearGradient>");a.push("</defs>"),a.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),a.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),a.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=H;n++){var c=ge(n-1,Fe,Ne);a.push('<path d="'+c+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=H;n++){var p=ge(n-1,Fe,Ne);a.push('<path id="fd-path-'+n+'" d="'+p+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}a.push('<line x1="'+q+'" y1="36" x2="'+q+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var u=5,b=Z-u;for(a.push('<rect x="0" y="'+r+'" width="'+b+'" height="'+pe+'" fill="url(#lbgrad)" rx="4"/>'),a.push('<rect x="'+Z+'" y="'+r+'" width="'+ae+'" height="'+pe+'" rx="6" fill="#EEA111"/>'),a.push('<text x="'+(Z+ae/2)+'" y="'+(ue-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),a.push('<text id="fd-flow-temp" x="'+(Z+ae/2)+'" y="'+(ue+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),a.push('<text id="fd-ret-temp" x="'+(Z+ae/2)+'" y="'+(r+pe+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),a.push('<text x="'+ke+'" y="34" font-size="11" fill="'+me+'" font-weight="700" letter-spacing="2">ZONE</text>'),a.push('<text x="'+Ye+'" y="34" font-size="11" fill="'+me+'" font-weight="700" letter-spacing="2">TEMP</text>'),a.push('<text x="'+Je+'" y="34" font-size="11" fill="'+me+'" font-weight="700" letter-spacing="2">FLOW</text>'),a.push('<text x="'+Qe+'" y="34" font-size="11" fill="'+me+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=H;n++){var g=Ke[n-1];a.push('<text id="fd-zn'+n+'" x="'+ke+'" y="'+(g+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),a.push('<text id="fd-zf'+n+'" x="'+ke+'" y="'+(g+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),a.push('<text id="fd-zt'+n+'" x="'+Ye+'" y="'+(g+10)+'" font-size="19" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),a.push('<text id="fd-zv'+n+'" x="'+Je+'" y="'+(g+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),a.push('<text id="fd-zr'+n+'" x="'+Qe+'" y="'+(g+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return a.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+ao+'" letter-spacing="3">\u0394T Flow-Return</text>'),a.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),a.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+H+" ZONES - HEATVALVE</text>"),a.push("</svg>"),'<div class="flow-wrap">'+a.join("")+"</div>"}var uo=()=>`<div class="flow-wrap">${mo()}</div>`;h({tag:"flow-diagram",render:uo,onMount(e,t){function r(){let o=f(l.flow),a=f(l.ret),i=t.querySelector("#fd-flow-temp"),n=t.querySelector("#fd-ret-temp"),c=t.querySelector("#fd-dt");if(i&&(i.textContent=M(o)),n&&(n.textContent="RET "+M(a)),c)if(o!=null&&a!=null){let p=Number(o)-Number(a);c.textContent=p.toFixed(1)+"\xB0C",c.setAttribute("fill",p<3?no:p>8?io:so)}else c.textContent="---";for(let p=1;p<=H;p++){let u=f(s.temp(p)),b=f(s.valve(p)),g=String(x(s.enabled(p))).toLowerCase()==="on",z=String(x(s.tempSource(p))||"Local Probe"),C=lo(x(s.probe(p))||""),S=C?f(s.probeTemp(C)):null,L=t.querySelector("#fd-zt"+p),J=t.querySelector("#fd-zv"+p),Q=t.querySelector("#fd-zr"+p),ne=t.querySelector("#fd-zn"+p),se=t.querySelector("#fd-zf"+p),I=t.querySelector("#fd-path-"+p),be=b!=null?Math.max(0,Math.min(100,Number(b)))/100:0;if(ne&&(ne.textContent="ZONE "+p),se){let fe=co(p);se.textContent=fe||"---"}if(ne&&ne.setAttribute("fill",g?eo:to),se&&se.setAttribute("fill",g?oo:ro),L&&(L.textContent=M(u)),J&&(J.textContent=G(b),J.setAttribute("fill",po(be,g))),Q&&(z!=="Local Probe"&&S!=null&&!Number.isNaN(Number(S))?(Q.textContent=M(S),Q.setAttribute("fill",g?Kt:et)):(Q.textContent="---",Q.setAttribute("fill",tt))),I)if(!g)I.setAttribute("d",ge(p-1,1,2)),I.setAttribute("fill","#2A2D38"),I.setAttribute("opacity","0.4");else{let fe=Math.max(3,be*Ne),nt=Math.max(1.5,be*Fe);I.setAttribute("d",ge(p-1,nt,fe)),I.setAttribute("fill","url(#rg"+p+")"),I.setAttribute("opacity","1")}}}m(l.flow,r),m(l.ret,r),_("zoneNames",r);for(let o=1;o<=H;o++)m(s.temp(o),r),m(s.valve(o),r),m(s.enabled(o),r),m(s.probe(o),r),m(s.tempSource(o),r);for(let o=1;o<=8;o++)m(s.probeTemp(o),r);r()}});var go=`
.diag-i2c {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-i2c .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-i2c pre {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 10px;
  font-size: .92rem;
  overflow-x: auto;
  margin: 0;
}
.btn-row { margin-top: 12px; }
.btn { padding: 7px 14px; border-radius: 10px; border: 1px solid var(--control-border); background: var(--control-bg); color: var(--text-strong); font-weight: 700; cursor: pointer; }
.btn:hover { background: var(--control-bg-hover); border-color: rgba(238,161,17,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;y("diag-i2c",go);var bo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,fa=h({tag:"diag-i2c",render:bo,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=w("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{He()}),_("i2cResult",o),o()}});var fo=`
.diag-zone {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.dz-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
@media (max-width: 900px) { .dz-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .dz-grid { grid-template-columns: 1fr; } }

.dz-zone-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dz-zone-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.dz-zone-name {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  text-transform: uppercase;
  letter-spacing: .6px;
}
.dz-state-badge {
  font-size: .62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .7px;
  border-radius: 999px;
  padding: 3px 9px;
  border: 1px solid transparent;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
}
.dz-state-badge.s-heating {
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
}
.dz-state-badge.s-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}
.dz-state-badge.s-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

.dz-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.dz-stat {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dz-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dz-stat-value {
  font-size: .88rem;
  font-weight: 800;
  color: var(--text-strong);
  font-family: var(--mono);
}

.dz-motor-section {
  border-top: 1px solid var(--panel-border);
  padding-top: 8px;
}
.dz-motor-label {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.dz-motor-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
}
.dz-motor-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 7px;
  padding: 5px 8px;
  font-size: .76rem;
  gap: 4px;
}
.dz-motor-param-name {
  color: var(--text-secondary);
  white-space: nowrap;
}
.dz-motor-param-val {
  color: var(--text-strong);
  font-family: var(--mono);
  font-weight: 700;
}

.dz-fault-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
  margin-top: 4px;
}
.dz-fault-label {
  color: var(--text-secondary);
  flex-shrink: 0;
}
.dz-fault-val {
  color: var(--state-danger);
  font-weight: 700;
  font-family: var(--mono);
}
`;y("diag-zone",fo);function vo(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function ot(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function rt(e){return e!=null?Number(e).toFixed(0):"---"}var xo=()=>{let e="";for(let t=1;t<=6;t++)e+=`
      <div class="dz-zone-card" data-zone="${t}">
        <div class="dz-zone-head">
          <span class="dz-zone-name">Zone ${t}</span>
          <span class="dz-state-badge" data-dz-state="${t}">---</span>
        </div>
        <div class="dz-stats">
          <div class="dz-stat"><span class="dz-stat-label">Room Temp</span><span class="dz-stat-value" data-dz-temp="${t}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Flow %</span><span class="dz-stat-value" data-dz-valve="${t}">---</span></div>
          <div class="dz-stat"><span class="dz-stat-label">Return</span><span class="dz-stat-value" data-dz-ret="${t}">---</span></div>
        </div>
        <div class="dz-motor-section">
          <div class="dz-motor-label">Motor ${t} learned parameters</div>
          <div class="dz-motor-grid">
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open ripples</span><span class="dz-motor-param-val" data-dz-orip="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close ripples</span><span class="dz-motor-param-val" data-dz-crip="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Open factor</span><span class="dz-motor-param-val" data-dz-ofac="${t}">---</span></div>
            <div class="dz-motor-param"><span class="dz-motor-param-name">Close factor</span><span class="dz-motor-param-val" data-dz-cfac="${t}">---</span></div>
          </div>
          <div class="dz-fault-row" data-dz-faultrow="${t}" style="display:none">
            <span class="dz-fault-label">Last fault</span>
            <span class="dz-fault-val" data-dz-fault="${t}">NONE</span>
          </div>
        </div>
      </div>`;return`
    <div class="diag-zone">
      <div class="card-title">Zone Snapshot</div>
      <div class="dz-grid">${e}</div>
    </div>
  `},Sa=h({tag:"diag-zone",render:xo,onMount(e,t){function r(o){let a=String(x(s.state(o))||"").toUpperCase()||"OFF",i=String(x(s.enabled(o))).toLowerCase()==="on",n=t.querySelector('[data-dz-state="'+o+'"]');n.textContent=i?a||"IDLE":"OFF",n.className="dz-state-badge"+(i&&a?" "+vo(a):""),t.querySelector('[data-dz-temp="'+o+'"]').textContent=M(f(s.temp(o))),t.querySelector('[data-dz-valve="'+o+'"]').textContent=G(f(s.valve(o))),t.querySelector('[data-dz-ret="'+o+'"]').textContent=M(f(l.ret)),t.querySelector('[data-dz-orip="'+o+'"]').textContent=rt(f(s.motorOpenRipples(o))),t.querySelector('[data-dz-crip="'+o+'"]').textContent=rt(f(s.motorCloseRipples(o))),t.querySelector('[data-dz-ofac="'+o+'"]').textContent=ot(f(s.motorOpenFactor(o))),t.querySelector('[data-dz-cfac="'+o+'"]').textContent=ot(f(s.motorCloseFactor(o)));let c=String(x(s.motorLastFault(o))||"").toUpperCase(),p=c&&c!=="NONE"&&c!=="OK"&&c!=="",u=t.querySelector('[data-dz-faultrow="'+o+'"]');u.style.display=p?"flex":"none",p&&(t.querySelector('[data-dz-fault="'+o+'"]').textContent=c)}for(let o=1;o<=6;o++){let a=o,i=()=>r(a);m(s.state(a),i),m(s.enabled(a),i),m(s.temp(a),i),m(s.valve(a),i),m(l.ret,i),m(s.motorOpenRipples(a),i),m(s.motorCloseRipples(a),i),m(s.motorOpenFactor(a),i),m(s.motorCloseFactor(a),i),m(s.motorLastFault(a),i),r(a)}}});var ho=`
.diag-activity {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.diag-activity .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.diag-log {
  margin-top: 8px;
  max-height: 220px;
  overflow-y: auto;
  border-radius: 10px;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(83,168,255,.25) transparent;
}
.diag-log::-webkit-scrollbar { width: 5px; }
.diag-log::-webkit-scrollbar-thumb { background: rgba(83,168,255,.25); border-radius: 999px; }
.diag-log::-webkit-scrollbar-track { background: transparent; }

.diag-log-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 16px; }
.diag-log-item { display: flex; gap: 8px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: .78rem; line-height: 1.4; }
.diag-log-item:last-child { border-bottom: none; }
.diag-log-time { font-family: var(--mono); color: var(--accent); font-size: .7rem; white-space: nowrap; flex-shrink: 0; }
.diag-log-msg { color: var(--text-strong); opacity: .9; }
`;y("diag-activity",ho);var yo=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function zo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Ea=h({tag:"diag-activity",render:yo,onMount(e,t){let r=t.querySelector(".diag-log");function o(){zo(r,Oe())}_("activityLog",o),o()}});var wo=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,118,118,.45);
  background: linear-gradient(180deg, rgba(83,32,32,.42), rgba(52,21,21,.36));
  border-radius: 12px;
  padding: 10px 12px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
}

.diag-manual-badge.on {
  display: flex;
}

.diag-manual-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: var(--state-danger);
  box-shadow: 0 0 10px rgba(255,118,118,.6);
}

.diag-manual-text {
  color: #FFD9D9;
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .35px;
  text-transform: uppercase;
}
`;y("diag-manual-badge",wo);var _o=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Oa=h({tag:"diag-manual-badge",render:_o,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let a=!!w("manualMode");r&&r.classList.toggle("on",a)}_("manualMode",o),o()}});var So=`
.diag-zone-motor {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-motor .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-motor .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-motor .cfg-row.manual-row {
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 12px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 14px;
}
.diag-zone-motor .manual-note {
  color: var(--text-secondary);
  font-size: .82rem;
  font-weight: 600;
}
.diag-zone-motor .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-motor .mn-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
.diag-zone-motor .sel {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-motor .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-motor .mn-inp {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  width: 80px;
  font-size: .95rem;
  transition: border-color .15s ease;
}
.diag-zone-motor .mn-inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-motor .mn-unit {
  color: var(--muted);
  font-size: .9rem;
  font-weight: 500;
}
.diag-zone-motor .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.diag-zone-motor .btn {
  flex: 1;
  min-width: 100px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-motor .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(238,161,17,.5);
  color: #ffe8ba;
}
.diag-zone-motor .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-motor .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
.diag-zone-motor .sw {
  width: 50px;
  height: 28px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  border: 1px solid var(--control-border);
  position: relative;
  cursor: pointer;
  transition: .2s ease;
  flex-shrink: 0;
}
.diag-zone-motor .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #dbe8ff;
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: rgba(83,168,255,.4);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}
.diag-zone-motor .gated {
  transition: opacity .18s ease;
}
.diag-zone-motor .gated.locked {
  opacity: .48;
}
.diag-zone-motor .gated.locked .btn,
.diag-zone-motor .gated.locked .mn-inp,
.diag-zone-motor .gated.locked .sel {
  cursor: not-allowed;
}
`;y("diag-zone-motor",So);var ko=e=>{let t=e.zone||w("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl">Motor</span>
          <select class="sel motor-zone-select">${r}</select>
        </div>
        <div class="cfg-row">
          <span class="lbl">Motor Target</span>
          <div class="mn-wrap">
            <input type="number" class="mn-inp motor-target-input" min="0" max="100" step="1" value="0">
            <span class="mn-unit">%</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn motor-open-btn">Open 10s</button>
          <button class="btn motor-close-btn">Close 10s</button>
          <button class="btn warn motor-stop-btn">Stop</button>
        </div>
      </div>
    </div>
  `},Ha=h({tag:"diag-zone-motor-card",render:ko,onMount(e,t){let r=Number(e.zone||w("selectedZone")||1),o=!!w("manualMode"),a=t.querySelector(".manual-mode-toggle"),i=t.querySelector(".motor-gated"),n=t.querySelector(".motor-zone-select"),c=t.querySelector(".motor-target-input"),p=t.querySelector(".motor-open-btn"),u=t.querySelector(".motor-close-btn"),b=t.querySelector(".motor-stop-btn");function g(S){o=!!S,a&&(a.classList.toggle("on",o),a.setAttribute("aria-checked",o?"true":"false")),i&&i.classList.toggle("locked",!o),[n,c,p,u,b].forEach(L=>{L&&(L.disabled=!o)})}function z(){let S=!o;if(g(S),S){Se(!0);for(let L=1;L<=6;L++)_e(L)}else Se(!1)}function C(){let S=f(s.motorTarget(r));c&&S!=null?c.value=Number(S).toFixed(0):c&&(c.value="0")}n==null||n.addEventListener("change",()=>{r=Number(n.value||1),C()}),a==null||a.addEventListener("click",z),a==null||a.addEventListener("keydown",S=>{S.key!==" "&&S.key!=="Enter"||(S.preventDefault(),z())});for(let S=1;S<=6;S++)m(s.motorTarget(S),C);C(),g(o),_("manualMode",()=>{g(!!w("manualMode"))}),c==null||c.addEventListener("change",S=>{if(!o)return;let L=S.target.value;Be(r,L)}),p==null||p.addEventListener("click",()=>{o&&We(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Ve(r,1e4)}),b==null||b.addEventListener("click",()=>{o&&_e(r)})}});var Fo=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone-recovery .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}
.diag-zone-recovery .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.diag-zone-recovery .cfg-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}
.diag-zone-recovery .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 140px;
}
.diag-zone-recovery .sel {
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  border-radius: 8px;
  padding: 6px 10px;
  color: var(--text);
  font-family: var(--mono);
  font-size: .95rem;
  min-width: 140px;
  transition: border-color .15s ease;
}
.diag-zone-recovery .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.diag-zone-recovery .btn {
  flex: 1;
  min-width: 140px;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: .9rem;
  cursor: pointer;
  background: var(--control-bg);
  border: 1px solid var(--control-border);
  color: var(--text-strong);
  transition: all 0.2s;
}
.diag-zone-recovery .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(238,161,17,.5);
  color: #ffe8ba;
}
.diag-zone-recovery .btn.warn {
  background: rgba(255,118,118,.2);
  border-color: rgba(255,118,118,.4);
  color: #FFD9D9;
}
.diag-zone-recovery .btn.warn:hover {
  background: linear-gradient(135deg, rgba(255,100,100,.3), rgba(255,100,100,.15));
  border-color: rgba(255,100,100,.5);
}
`;y("diag-zone-recovery",Fo);var No=e=>{let t=e.zone||w("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
    <div class="diag-zone-recovery">
      <div class="card-title">Motor Recovery</div>
      <div class="cfg-row">
        <span class="lbl">Motor</span>
        <select class="sel recovery-zone-select">${r}</select>
      </div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
    </div>
  `},Ga=h({tag:"diag-zone-recovery-card",render:No,onMount(e,t){let r=Number(e.zone||w("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),a=t.querySelector(".recovery-fault-btn"),i=t.querySelector(".recovery-factors-btn"),n=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),a==null||a.addEventListener("click",()=>{je(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&Ue(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&Ge(r)})}});var Co=`
.settings-manifold-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-manifold-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-manifold-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 10px;
}

.settings-manifold-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-manifold-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-manifold-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  border: 1px solid var(--control-border);
  border-radius: 10px;
  padding: 10px;
  background: var(--control-bg);
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .5px;
}

.settings-manifold-card .probe-temp {
  margin-top: 4px;
  font-size: 1rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .settings-manifold-card .probe-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;y("settings-manifold-card",Co);var Eo=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},tn=h({tag:"settings-manifold-card",render:Eo,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret");function i(){r.value=x(l.manifoldType)||"NC (Normally Closed)",o.value=x(l.manifoldFlowProbe)||"Probe 7",a.value=x(l.manifoldReturnProbe)||"Probe 8";for(let n=1;n<=8;n++){let c=t.querySelector('[data-probe="'+n+'"]'),p=f(s.probeTemp(n));c&&(c.textContent=M(p))}}r.addEventListener("change",()=>X("manifold_type",r.value)),o.addEventListener("change",()=>X("manifold_flow_probe",o.value)),a.addEventListener("change",()=>X("manifold_return_probe",a.value)),m(l.manifoldType,i),m(l.manifoldFlowProbe,i),m(l.manifoldReturnProbe,i);for(let n=1;n<=8;n++)m(s.probeTemp(n),i);i()}});var Mo=`
.settings-control-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-control-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-control-card .btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.settings-control-card .btn {
  flex: 1;
  min-width: 180px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-control-card .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,168,255,.52);
  color: var(--text-strong);
}

.settings-control-card .btn.warn {
  border: 1px solid rgba(255,118,118,.5);
  background: rgba(255,118,118,.2);
  color: #FFD9D9;
}

.settings-control-card .btn.warn:hover {
  background: rgba(255,100,100,.3);
  border-color: rgba(255,100,100,.6);
}
`;y("settings-control-card",Mo);var Lo=()=>`
  <div class="settings-control-card">
    <div class="card-title">Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,sn=h({tag:"settings-control-card",render:Lo,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{T("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{T("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{T("restart")})}});var Do=`
.settings-motor-cal-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-motor-cal-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-motor-cal-card .hint {
  color: var(--text-secondary);
  font-size: .78rem;
  margin-bottom: 12px;
}

.settings-motor-cal-card .cfg-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-motor-cal-card .cfg-row {
  display: grid;
  gap: 6px;
}

.settings-motor-cal-card .cfg-row.full {
  grid-column: 1 / -1;
}

.settings-motor-cal-card .lbl {
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-motor-cal-card .txt {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .sel {
  width: 100%;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .86rem;
}

.settings-motor-cal-card .txt:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .sel:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-motor-cal-card .unit {
  color: var(--text-faint);
  font-size: .7rem;
}

.settings-motor-cal-card .runtime-note {
  grid-column: 1 / -1;
  color: var(--state-warn);
  font-size: .74rem;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  border-radius: 10px;
  padding: 8px 10px;
}

@media (max-width: 960px) {
  .settings-motor-cal-card .cfg-grid { grid-template-columns: 1fr; }
}
`;y("settings-motor-calibration-card",Do);var Y=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:l.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:l.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:l.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:l.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:l.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:l.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:l.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Ao=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<Y.length;r++){let o=Y[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function Oo(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"}function at(e,t){let r=Number(t);return Number.isFinite(r)?Oo(e)?String(Math.round(r)):r.toFixed(2):"0"}var gn=h({tag:"settings-motor-calibration-card",render:Ao,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function a(n){if(n==="HmIP VdMot"&&oe("hmip_runtime_limit_seconds",40),n==="Generic"){let c=Number(f(l.genericRuntimeLimitSeconds));(!Number.isFinite(c)||c<=0)&&oe("generic_runtime_limit_seconds",45)}}function i(){let n=x(l.motorProfileDefault)||"HmIP VdMot";r&&(r.value=n),o&&(n==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=at("generic_runtime_limit_seconds",f(l.genericRuntimeLimitSeconds)),o.disabled=!1));for(let c=0;c<Y.length;c++){let p=Y[c],u=t.querySelector(".smc-"+p.cls);u&&p.key!=="generic_runtime_limit_seconds"&&(u.value=at(p.key,f(p.id)))}}r&&(r.addEventListener("change",()=>{X("motor_profile_default",r.value),a(r.value)}),m(l.motorProfileDefault,i));for(let n=0;n<Y.length;n++){let c=Y[n],p=t.querySelector(".smc-"+c.cls);p&&(p.addEventListener("change",()=>{if(c.key==="generic_runtime_limit_seconds"){if((x(l.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;oe("generic_runtime_limit_seconds",p.value);return}oe(c.key,p.value)}),m(c.id,i))}m(l.genericRuntimeLimitSeconds,i),m(l.hmipRuntimeLimitSeconds,i),a(x(l.motorProfileDefault)||"HmIP VdMot"),i()}});var To=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  --accent: #EEA111;
  --blue: #53A8FF;
  --bg: #0E1A2C;
  --surface: #132744;
  --card: #0F213C;
  --border: rgba(120,168,255,.24);
  --text: #FFFFFF;
  --text-strong: #F3F8FF;
  --text-secondary: rgba(214,228,255,.86);
  --muted: rgba(214,228,255,.78);
  --text-faint: rgba(191,211,245,.58);
  --text-on-accent: #101C30;
  --soft: rgba(132,180,255,.12);
  --panel-border: rgba(120,168,255,.28);
  --panel-bg: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
  --panel-bg-vibrant: radial-gradient(900px 300px at 90% -40%, rgba(83,168,255,.18), transparent 62%), linear-gradient(180deg, rgba(20,44,79,.44), rgba(13,31,58,.38));
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
  --state-ok: #79d17e;
  --state-warn: #f2c77b;
  --state-danger: #ff7676;
  --state-disabled: #7D8BA7;
  --control-bg: rgba(83,168,255,.1);
  --control-bg-hover: rgba(83,168,255,.16);
  --control-border: rgba(120,168,255,.32);
  --control-border-strong: rgba(120,168,255,.45);
  --viz-flow-low: #8FCBFF;
  --viz-flow-mid: #BCDFFF;
  --viz-flow-high: #E4D092;
  --viz-flow-hot: #F2B74C;
  --viz-delta-low: #42A5F5;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #EF5350;
  --green: #79d17e;
  --red: #ff6464;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(238,161,17,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(83,168,255,.2), transparent 64%),
    var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.45;
  -webkit-font-smoothing: antialiased;
}

.app {
  display: block;
  min-height: 100vh;
}

.shell {
  padding: 18px;
  width: min(1320px, 100%);
  margin: 0 auto;
}

.sec {
  display: none;
  margin-bottom: 22px;
}

.sec.active {
  display: block;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr .8fr .8fr;
  gap: 14px;
  margin-top: 14px;
}

.zone-layout,
.diag-layout,
.settings-layout {
  display: grid;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr;
}

.zone-right-stack {
  display: grid;
  gap: 14px;
}

.settings-layout {
  grid-template-columns: 1.15fr .85fr;
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: linear-gradient(180deg, rgba(20,44,79,.42), rgba(13,31,58,.36));
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.35);
}

.placeholder-card h3 {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
}

.placeholder-card p {
  color: var(--muted);
  font-size: .86rem;
}

@media (max-width: 1080px) {
  .dashboard-grid { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout { grid-template-columns: 1fr; }
}

/* ============================
   GLOBAL INTERACTIVE STATES
   ============================ */

/* Consistent focus ring for all interactive elements */
button:focus-visible,
select:focus-visible,
input:focus-visible,
a:focus-visible {
  outline: 2px solid rgba(83,168,255,.72);
  outline-offset: 2px;
}

/* Disabled state for all buttons/inputs */
button:disabled,
input:disabled,
select:disabled {
  opacity: .40;
  cursor: not-allowed;
  pointer-events: none;
}
`;y("app-root",To);var Ro=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="dashboard-grid">
          <div class="overview-status"></div>
          <div class="overview-connectivity"></div>
          <div class="overview-graphs"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-right-stack">
            <div class="zone-sensor-slot"></div>
            <div class="zone-room-slot"></div>
          </div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="diag-manual-badge-slot"></div>
        <div class="diag-layout"></div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-control-slot"></div>
          <div class="settings-motor-cal-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;h({tag:"app-root",render:Ro,onMount(e,t){t.querySelector(".hdr").appendChild(N("hv6-header")),t.querySelector(".overview-flow").appendChild(N("flow-diagram")),t.querySelector(".overview-status").appendChild(N("status-card")),t.querySelector(".overview-connectivity").appendChild(N("connectivity-card")),t.querySelector(".overview-graphs").appendChild(N("graph-widgets")),t.querySelector(".zone-selector").appendChild(N("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(N("zone-detail",{zone:w("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(N("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(N("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(N("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(N("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(N("settings-motor-calibration-card")),t.querySelector(".diag-manual-badge-slot").appendChild(N("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(N("diag-i2c")),r.appendChild(N("diag-activity")),r.appendChild(N("diag-zone"));let o=w("selectedZone")||1;r.appendChild(N("diag-zone-motor-card",{zone:o})),r.appendChild(N("diag-zone-recovery-card",{zone:o}));function a(){let i=w("section");t.querySelectorAll(".sec").forEach(n=>{n.classList.toggle("active",n.getAttribute("data-section")===i)})}_("section",a),a()}});function qo(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(N("app-root")),ye()}qo();})();

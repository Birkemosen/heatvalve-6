(()=>{var Le={},le={};function h(e){return Le[e.tag]=e,e}function C(e,t){let r=Le[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let i=r.state(t||{});for(let c in i)o[c]=i[c]}if(r.methods)for(let i in r.methods)o[i]=r.methods[i];let a=document.createElement("div");a.innerHTML=r.render(o);let n=a.firstElementChild;return r.onMount&&r.onMount(o,n),n}function p(e,t){(le[e]||(le[e]=[])).push(t)}function D(e){let t=le[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var H=6,pt=28,de=Object.create(null),mt=gt(),N={section:"overview",selectedZone:1,live:!1,pendingWrites:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:ut(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:mt,manualMode:!1};function ut(){let e=Object.create(null);for(let t=1;t<=H;t++)e[t]=[];return e}function gt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<H;)e.push("");return e.slice(0,H)}function bt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(N.zoneNames))}catch(e){}}function O(e){return"$dashboard:"+e}function ce(e){return Math.max(1,Math.min(H,Number(e)||1))}function De(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function f(e){let t=de[e];return t?t.v!=null?t.v:t.value!=null?t.value:De(t.s!=null?t.s:t.state):null}function _(e){let t=de[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function ft(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function A(e){return ft(_(e))}function d(e,t){let r=de[e];r||(r=de[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);D(e),e==="text_sensor-firmware_version"&&W("firmwareVersion",_(e)||"")}function F(e,t){p(O(e),t)}function S(e){return N[e]}function W(e,t){N[e]=t,D(O(e))}function Oe(e){N.section!==e&&(N.section=e,D(O("section")))}function Ae(e){let t=ce(e);N.selectedZone!==t&&(N.selectedZone=t,D(O("selectedZone")))}function V(e){let t=!!e;N.live!==t&&(N.live=t,D(O("live")))}function Te(){N.pendingWrites+=1,D(O("pendingWrites"))}function he(){N.pendingWrites=Math.max(0,N.pendingWrites-1),D(O("pendingWrites"))}function Re(e,t){let r=ce(e)-1;N.zoneNames[r]=String(t||"").trim(),bt(),D(O("zoneNames"))}function Z(e){return N.zoneNames[ce(e)-1]||""}function j(e){let t=ce(e),r=Z(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function U(e){N.i2cResult=e||"No scan has been run yet.",D(O("i2cResult"))}function E(e,t){let r={time:vt(),msg:String(e||"")};for(N.activityLog.push(r);N.activityLog.length>60;)N.activityLog.shift();if(t>=1&&t<=H){let o=N.zoneLog[t];for(o.push(r);o.length>8;)o.shift();D(O("zoneLog:"+t))}D(O("activityLog"))}function qe(e){return e>=1&&e<=H?N.zoneLog[e]:N.activityLog}function xe(e,t){let r=N[e];if(!Array.isArray(r))return;let o=De(t);if(o!=null){for(r.push(o);r.length>pt;)r.shift();D(O(e))}}function ee(e){let t=Date.now();if(!e&&t-N.lastHistoryAt<3200)return;N.lastHistoryAt=t;let r=0,o=0;for(let a=1;a<=H;a++){let n=f("sensor-zone_"+a+"_valve_pct");n!=null&&(r+=n,o+=1)}xe("historyFlow",f("sensor-manifold_flow_temperature")),xe("historyReturn",f("sensor-manifold_return_temperature")),xe("historyDemand",o?r/o:0)}function vt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}var s={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},l={flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct"};var M=6,xt=8,Pe=null,te=0,v={temp:new Float32Array(M),setpoint:new Float32Array(M),valve:new Float32Array(M),enabled:new Uint8Array(M),driversEnabled:1,fault:0,manualMode:0};function ht(){v.manualMode=0,W("manualMode",!1);for(let e=0;e<M;e++){v.temp[e]=20.5+e*.4,v.setpoint[e]=21+e%3*.5,v.valve[e]=12+e*8,v.enabled[e]=e===4?0:1;let t=e+1;d(s.temp(t),{value:v.temp[e]}),d(s.setpoint(t),{value:v.setpoint[e]}),d(s.valve(t),{value:v.valve[e]}),d(s.state(t),{state:v.valve[e]>5?"heating":"idle"}),d(s.enabled(t),{value:!!v.enabled[e],state:v.enabled[e]?"on":"off"}),d(s.probe(t),{state:"Probe "+t}),d(s.tempSource(t),{state:t%2?"Local Probe":"BLE Sensor"}),d(s.syncTo(t),{state:"None"}),d(s.pipeType(t),{state:"PEX 16mm"}),d(s.area(t),{value:8+t*3.5}),d(s.spacing(t),{value:[150,200,150,100,200,150][e]}),d(s.zigbee(t),{state:"zone_"+t+"_mock_sensor"}),d(s.ble(t),{state:"AA:BB:CC:DD:EE:0"+t}),d(s.exteriorWalls(t),{state:["N","E","S","W","N,E","S,W"][e]})}for(let e=1;e<=xt;e++){let t=e<=M?e:M,r=v.temp[t-1]+(e>M?1:.1*e);d(s.probeTemp(e),{value:r})}d(l.flow,{value:34.1}),d(l.ret,{value:30.4}),d(l.uptime,{value:18*3600+720}),d(l.wifi,{value:-57}),d(l.drivers,{value:!0,state:"on"}),d(l.fault,{value:!1,state:"off"}),d(l.ip,{state:"192.168.1.86"}),d(l.ssid,{state:"MockLab"}),d(l.mac,{state:"D8:3B:DA:12:34:56"}),d(l.firmware,{state:"0.5.x-mock"}),d(l.manifoldFlowProbe,{state:"Probe 7"}),d(l.manifoldReturnProbe,{state:"Probe 8"}),d(l.manifoldType,{state:"NC (Normally Closed)"}),d(l.motorProfileDefault,{state:"HmIP VdMot"}),d(l.closeThresholdMultiplier,{value:1.7}),d(l.closeSlopeThreshold,{value:1}),d(l.closeSlopeCurrentFactor,{value:1.4}),d(l.openThresholdMultiplier,{value:1.7}),d(l.openSlopeThreshold,{value:.8}),d(l.openSlopeCurrentFactor,{value:1.3}),d(l.openRippleLimitFactor,{value:1}),d(l.genericRuntimeLimitSeconds,{value:45}),d(l.hmipRuntimeLimitSeconds,{value:40}),d(l.learnedFactorMinSamples,{value:3}),d(l.learnedFactorMaxDeviationPct,{value:12}),ee(!0)}function yt(){te+=1,d(l.uptime,{value:Number(Date.now()/1e3)|0}),d(l.wifi,{value:-55-Math.round((1+Math.sin(te/4))*6)});let e=0,t=0,r=0;for(let n=0;n<M;n++){let i=n+1,c=!!v.enabled[n],g=v.temp[n],u=v.setpoint[n],m=c&&v.driversEnabled&&!v.manualMode&&g<u-.25;v.manualMode?v.valve[n]=Math.max(0,v.valve[n]):!c||!v.driversEnabled?v.valve[n]=Math.max(0,v.valve[n]-6):m?v.valve[n]=Math.min(100,v.valve[n]+7+i%3):v.valve[n]=Math.max(0,v.valve[n]-5);let b=m?.05+v.valve[n]/2200:-.03+v.valve[n]/3200;v.temp[n]=g+b+Math.sin((te+i)/5)*.04,c&&v.valve[n]>0&&(e+=v.valve[n],t+=1,r=Math.max(r,v.valve[n])),d(s.temp(i),{value:v.temp[n]}),d(s.valve(i),{value:Math.round(v.valve[n])}),d(s.state(i),{state:c?m?"heating":"idle":"off"}),d(s.enabled(i),{value:c,state:c?"on":"off"}),d(s.probeTemp(i),{value:v.temp[n]+Math.sin((te+i)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(te/6)*.25,a=o-(t?2.1+e/Math.max(1,t*50):1.1);d(l.flow,{value:Number(o.toFixed(1))}),d(l.ret,{value:Number(a.toFixed(1))}),d(s.probeTemp(7),{value:Number((a-.4).toFixed(1))}),d(s.probeTemp(8),{value:Number((o+.2).toFixed(1))}),ee(!0)}function Ie(){Pe||(ht(),V(!0),Pe=setInterval(yt,1200))}function pe(e){let t=new URL(e,"http://localhost"),r=t.pathname.split("/").filter(Boolean);if(r[0]==="zones"&&r[2]==="setpoint"){let o=Number(r[1]),a=Number(t.searchParams.get("setpoint_c"));o>=1&&o<=M&&!Number.isNaN(a)&&(v.setpoint[o-1]=a,d(s.setpoint(o),{value:a}),E("Zone "+o+" setpoint set to "+a.toFixed(1)+"\xB0C",o));return}if(r[0]==="zones"&&r[2]==="enabled"){let o=Number(r[1]),a=t.searchParams.get("enabled")==="true";o>=1&&o<=M&&(v.enabled[o-1]=a?1:0,d(s.enabled(o),{value:a,state:a?"on":"off"}),E("Zone "+o+(a?" enabled":" disabled"),o));return}if(r[0]==="drivers"&&r[1]==="enabled"){v.driversEnabled=t.searchParams.get("enabled")==="true"?1:0,d(l.drivers,{value:!!v.driversEnabled,state:v.driversEnabled?"on":"off"}),E(v.driversEnabled?"Motor drivers enabled":"Motor drivers disabled");return}if(r[0]==="manual_mode"){let o=t.searchParams.get("enabled")==="true";v.manualMode=o?1:0,W("manualMode",o);return}if(r[0]==="motors"&&r[2]==="target"){let o=Number(r[1]),a=Number(t.searchParams.get("value")||"0");o>=1&&o<=M&&!Number.isNaN(a)&&(d(s.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(a)))}),E("Motor "+o+" target set to "+a+"%",o));return}if(r[0]==="settings"){let o=t.searchParams.get("key")||"",a=t.searchParams.get("value")||"",n=Number(t.searchParams.get("zone")||"1");if(r[1]==="select"){o==="zone_probe"&&d(s.probe(n),{state:a}),o==="zone_temp_source"&&d(s.tempSource(n),{state:a}),o==="zone_sync_to"&&d(s.syncTo(n),{state:a}),o==="zone_pipe_type"&&d(s.pipeType(n),{state:a}),o==="manifold_type"&&d(l.manifoldType,{state:a}),o==="manifold_flow_probe"&&d(l.manifoldFlowProbe,{state:a}),o==="manifold_return_probe"&&d(l.manifoldReturnProbe,{state:a}),o==="motor_profile_default"&&d(l.motorProfileDefault,{state:a}),E("Setting updated: "+o+" = "+a,n);return}if(r[1]==="text"){o==="zone_zigbee_device"&&d(s.zigbee(n),{state:a}),o==="zone_ble_mac"&&d(s.ble(n),{state:a}),o==="zone_exterior_walls"&&d(s.exteriorWalls(n),{state:a||"None"}),E("Setting updated: "+o+" = "+a,n);return}if(r[1]==="number"){let i=Number(a);o==="zone_area_m2"&&!Number.isNaN(i)&&d(s.area(n),{value:i}),o==="zone_pipe_spacing_mm"&&!Number.isNaN(i)&&d(s.spacing(n),{value:i}),o==="close_threshold_multiplier"&&!Number.isNaN(i)&&d(l.closeThresholdMultiplier,{value:i}),o==="close_slope_threshold"&&!Number.isNaN(i)&&d(l.closeSlopeThreshold,{value:i}),o==="close_slope_current_factor"&&!Number.isNaN(i)&&d(l.closeSlopeCurrentFactor,{value:i}),o==="open_threshold_multiplier"&&!Number.isNaN(i)&&d(l.openThresholdMultiplier,{value:i}),o==="open_slope_threshold"&&!Number.isNaN(i)&&d(l.openSlopeThreshold,{value:i}),o==="open_slope_current_factor"&&!Number.isNaN(i)&&d(l.openSlopeCurrentFactor,{value:i}),o==="open_ripple_limit_factor"&&!Number.isNaN(i)&&d(l.openRippleLimitFactor,{value:i}),o==="generic_runtime_limit_seconds"&&!Number.isNaN(i)&&d(l.genericRuntimeLimitSeconds,{value:i}),o==="hmip_runtime_limit_seconds"&&!Number.isNaN(i)&&d(l.hmipRuntimeLimitSeconds,{value:i}),o==="learned_factor_min_samples"&&!Number.isNaN(i)&&d(l.learnedFactorMinSamples,{value:i}),o==="learned_factor_max_deviation_pct"&&!Number.isNaN(i)&&d(l.learnedFactorMaxDeviationPct,{value:i}),E("Setting updated: "+o+" = "+a,n);return}}if(r[0]==="commands"){let o=t.searchParams.get("command"),a=Number(t.searchParams.get("zone")||"0");if(o==="i2c_scan"){U(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),E("I2C scan complete");return}if(o==="reset_1wire_probe_map_reboot"||o==="dump_1wire_probe_diagnostics"||o==="restart"){E("Command executed: "+o);return}if(o==="open_motor_timed"&&a>=1&&a<=M){let n=Number(t.searchParams.get("duration_ms")||"10000");E("Motor "+a+" open timed for "+n+"ms",a);return}if(o==="close_motor_timed"&&a>=1&&a<=M){let n=Number(t.searchParams.get("duration_ms")||"10000");E("Motor "+a+" close timed for "+n+"ms",a);return}if(o==="stop_motor"&&a>=1&&a<=M){E("Motor "+a+" stopped",a);return}if(o==="motor_reset_fault"&&a>=1&&a<=M){E("Motor "+a+" fault reset",a);return}if(o==="motor_reset_learned_factors"&&a>=1&&a<=M){E("Motor "+a+" learned factors reset",a);return}if(o==="motor_reset_and_relearn"&&a>=1&&a<=M){E("Motor "+a+" reset and relearn started",a);return}}}window.__hv6_mock={setSetpoint(e,t){pe("/zones/"+e+"/setpoint?setpoint_c="+t)},toggleZone(e){let t=!v.enabled[e-1];pe("/zones/"+e+"/enabled?enabled="+(t?"true":"false"))}};var G,ye=null;function zt(e){if(!(!e||typeof e!="object")){for(let t in e)d(t,e[t]);ee(!1)}}function wt(e){let t=null;try{t=JSON.parse(e.data)}catch(r){return}if(!(!t||!t.type)){if(t.type==="state"){zt(t.data);return}if(t.type==="log"){let r=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!r)return;E(r),String(r).indexOf("I2C_SCAN:")!==-1&&U(String(r))}}}function _t(){ye||(ye=setTimeout(()=>{ye=null,ze()},2500))}function ze(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Ie();return}G&&G.close(),G=new EventSource("/api/hv6/v1/events"),G.onopen=()=>V(!0),G.onmessage=wt,G.onerror=function(){V(!1),_t()}}var Ze=Object.create(null);function y(e,t){if(Ze[e])return;Ze[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function L(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function $(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function me(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function He(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var St=`
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
`;y("hv6-header",St);var kt=()=>`
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
`,dr=h({tag:"hv6-header",render:kt,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),a=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),c=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function u(){let b=S("section");g.forEach(w=>{w.classList.toggle("active",w.getAttribute("data-section")===b)})}function m(){let b=S("live"),w=S("pendingWrites"),x=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":b?"Live":"Offline";r.textContent=x,o.classList.toggle("on",!!b),a.textContent=w>0?"Saving...":b?"Synced":"Offline";let z=w>0?"saving":b?"synced":"offline";a.className="meta-chip meta-chip-state "+z,n.textContent=me(f(l.uptime)),i.textContent=He(f(l.wifi));let k=S("firmwareVersion")||_(l.firmware);c.textContent=k?"FW "+k:""}g.forEach(b=>{b.addEventListener("click",w=>{w.preventDefault(),Oe(b.getAttribute("data-section"))})}),F("section",u),F("live",m),F("pendingWrites",m),F("firmwareVersion",m),p(l.uptime,m),p(l.wifi,m),p(l.firmware,m),u(),m()}});var Ft="/api/hv6/v1";function Et(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function T(e){if(Te(),Et())try{return pe(e),Promise.resolve({ok:!0})}finally{he()}return fetch(Ft+e,{method:"POST"}).finally(()=>{he()})}function we(e,t){return d(s.setpoint(e),{value:t}),T("/zones/"+e+"/setpoint?setpoint_c="+encodeURIComponent(t))}function Be(e,t){return d(s.enabled(e),{state:t?"on":"off",value:t}),T("/zones/"+e+"/enabled?enabled="+(t?"true":"false"))}function We(e){return d(l.drivers,{state:e?"on":"off",value:e}),T("/drivers/enabled?enabled="+(e?"true":"false"))}function R(e,t,r=""){let o=t?"&zone="+t:"";return T("/commands?command="+encodeURIComponent(e)+o+r)}function Ve(){return U("Scanning I2C bus..."),E("I2C scan started"),R("i2c_scan")}var Nt={zone_probe:e=>s.probe(e),zone_temp_source:e=>s.tempSource(e),zone_sync_to:e=>s.syncTo(e),zone_pipe_type:e=>s.pipeType(e)},Ct={zone_zigbee_device:e=>s.zigbee(e),zone_ble_mac:e=>s.ble(e),zone_exterior_walls:e=>s.exteriorWalls(e)},Mt={zone_area_m2:e=>s.area(e),zone_pipe_spacing_mm:e=>s.spacing(e)},Lt={manifold_type:l.manifoldType,manifold_flow_probe:l.manifoldFlowProbe,manifold_return_probe:l.manifoldReturnProbe,motor_profile_default:l.motorProfileDefault},Dt={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct};function X(e,t,r){let o=Nt[t];return o&&d(o(e),{state:r}),T("/settings/select?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function oe(e,t,r){let o=Ct[t];return o&&d(o(e),{state:r}),T("/settings/text?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function _e(e,t,r){let o=Number(r),a=Mt[t];return a&&!Number.isNaN(o)&&d(a(e),{value:o}),T("/settings/number?key="+encodeURIComponent(t)+"&value="+encodeURIComponent(r)+"&zone="+e)}function Y(e,t){let r=Lt[e];return r&&d(r,{state:t}),T("/settings/select?key="+encodeURIComponent(e)+"&value="+encodeURIComponent(t))}function re(e,t){let r=Number(t),o=Dt[e];return o&&!Number.isNaN(r)&&d(o,{value:r}),T("/settings/number?key="+encodeURIComponent(e)+"&value="+encodeURIComponent(t))}function je(e,t){let r=Number(t);if(Number.isNaN(r))return T("/motors/"+e+"/target?value=0");let o=Math.max(0,Math.min(100,Math.round(r)));return d(s.motorTarget(e),{value:o}),E("Motor "+e+" target set to "+o+"%",e),T("/motors/"+e+"/target?value="+o)}function Ue(e,t=1e4){return E("Motor "+e+" open for "+t+"ms",e),R("open_motor_timed",e,"&duration_ms="+t)}function Ge(e,t=1e4){return E("Motor "+e+" close for "+t+"ms",e),R("close_motor_timed",e,"&duration_ms="+t)}function Se(e){return E("Motor "+e+" stopped",e),R("stop_motor",e)}function ke(e){return W("manualMode",!!e),E(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),T("/manual_mode?enabled="+(e?"true":"false"))}function $e(e){return E("Motor "+e+" fault reset",e),R("motor_reset_fault",e)}function Xe(e){return E("Motor "+e+" learned factors reset",e),R("motor_reset_learned_factors",e)}function Ye(e){return E("Motor "+e+" reset and relearn started",e),R("motor_reset_and_relearn",e)}var Ot=`
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
`;y("status-card",Ot);var At=e=>`
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
`,yr=h({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:At,methods:{update(e){this.motorDriversOn=A(l.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=A(l.fault)?"FAULT":"OK",this.connOn=S("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);p(l.drivers,o),p(l.fault,o),F("live",o),r.sw.onclick=()=>{We(!e.motorDriversOn)},o()}});var Tt=`
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
`;y("connectivity-card",Tt);var Rt=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Er=h({tag:"connectivity-card",render:Rt,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function i(){r.textContent=_(l.ip)||"---",o.textContent=_(l.ssid)||"---",a.textContent=_(l.mac)||"---",n.textContent=me(f(l.uptime))}p(l.ip,i),p(l.ssid,i),p(l.mac,i),p(l.uptime,i),i()}});var qt=`
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
`;y("graph-widgets",qt);var Pt=()=>`
  <div class="graph-widgets">
    <div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div>
    <div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div>
  </div>
`;function Je(e,t,r,o){if(!e.length)return"";let a=Math.min.apply(null,e),n=Math.max.apply(null,e),i=Math.max(.001,n-a),c=e.length>1?(t-o*2)/(e.length-1):0,g="";for(let u=0;u<e.length;u++){let m=o+c*u,b=r-o-(e[u]-a)/i*(r-o*2);g+=(u?" L ":"M ")+m.toFixed(2)+" "+b.toFixed(2)}return g}function Ke(e,t,r,o,a){e.innerHTML="";let n=Je(t,220,56,5);if(n){let c=document.createElementNS("http://www.w3.org/2000/svg","path");c.setAttribute("d",n),c.setAttribute("fill","none"),c.setAttribute("stroke",r),c.setAttribute("stroke-width","2.2"),c.setAttribute("stroke-linecap","round"),e.appendChild(c)}let i=o&&o.length?Je(o,220,56,5):"";if(i){let c=document.createElementNS("http://www.w3.org/2000/svg","path");c.setAttribute("d",i),c.setAttribute("fill","none"),c.setAttribute("stroke",a),c.setAttribute("stroke-width","2"),c.setAttribute("stroke-linecap","round"),e.appendChild(c)}}var It="var(--accent)",Zt="var(--blue)",Ht="var(--blue)",Dr=h({tag:"graph-widgets",render:Pt,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand");function i(){let c=S("historyFlow"),g=S("historyReturn"),u=S("historyDemand"),m=c.length?c[c.length-1]:null,b=g.length?g[g.length-1]:null,w=u.length?u[u.length-1]:null;r.textContent=m!=null&&b!=null?(m-b).toFixed(1)+" C":"---",o.textContent=w!=null?Math.round(w)+"%":"---",Ke(a,c,It,g,Zt),Ke(n,u,Ht)}F("historyFlow",i),F("historyReturn",i),F("historyDemand",i),i()}});var Bt=`
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
`;y("zone-grid",Bt);var Wt=()=>'<div class="zone-grid"></div>',Rr=h({tag:"zone-grid",render:Wt,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(C("zone-card",{zone:r}))}});var Vt=`
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
`;y("zone-card",Vt);var jt=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${j(e.zone)}</div>
		<div class="zc-friendly">${Z(e.zone)||"---"}</div>
	</div>
`,Wr=h({tag:"zone-card",state:e=>({zone:e.zone}),render:jt,onMount(e,t){let r=e.zone,o=s.temp(r),a=s.state(r),n=s.enabled(r),i=t.querySelector(".zc-state-label"),c=t.querySelector(".zc-dot"),g=t.querySelector(".zc-zone-name"),u=t.querySelector(".zc-friendly");function m(){let b=A(n),w=String(_(a)||"").toUpperCase()||"OFF",x=S("selectedZone")===r,z=Z(r);g.textContent=j(r),u.textContent=z||L(f(o)),i.textContent=b?w:"OFF";let k=b?w:"OFF",q=k==="HEATING"?"#f2c77b":k==="IDLE"?"#79d17e":k==="FAULT"?"#ff7676":"#7D8BA7",Q=k==="HEATING"?"#EEA111":k==="IDLE"?"#79d17e":k==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";i.style.color=q,c.style.background=Q,c.style.boxShadow=k==="HEATING"?"0 0 5px rgba(238,161,17,.6)":k==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",x),t.classList.toggle("disabled",!b),t.classList.toggle("zs-heating",b&&w==="HEATING"),t.classList.toggle("zs-idle",b&&w!=="HEATING"),t.classList.toggle("zs-off",!b)}t.addEventListener("click",()=>{Ae(r)}),p(o,m),p(a,m),p(n,m),F("selectedZone",m),F("zoneNames",m),m()}});var Ut=`
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
`;y("zone-detail",Ut);var Gt=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${j(e.zone)}</div>
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
`,Jr=h({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Gt,methods:{update(e,t){let r=S("selectedZone"),o=String(_(s.state(r))||"").toUpperCase(),a=A(s.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=j(r),t.setpoint.textContent=L(f(s.setpoint(r))),t.temp.textContent=L(f(s.temp(r))),t.ret.textContent=L(f("sensor-manifold_return_temperature")),t.valve.textContent=$(f(s.valve(r)));let n=t.badge;n.textContent=a?o||"IDLE":"DISABLED";let i=a?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(i?" "+i:""),t.toggle.classList.toggle("on",a)},incSetpoint(){let e=this.zone,t=f(s.setpoint(e))||20;we(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=f(s.setpoint(e))||20;we(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=A(s.enabled(e));Be(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),a=n=>{let i=S("selectedZone");(n===s.temp(i)||n===s.setpoint(i)||n===s.valve(i)||n===s.state(i)||n===s.enabled(i))&&o()};for(let n=1;n<=6;n++)p(s.temp(n),a),p(s.setpoint(n),a),p(s.valve(n),a),p(s.state(n),a),p(s.enabled(n),a);p("sensor-manifold_return_temperature",o),F("selectedZone",o),o()}});var $t=`
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
`;y("zone-sensor-card",$t);var Xt=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
  `};function Yt(e,t){let r=e.value,o="<option>None</option>";for(let a=1;a<=6;a++)a!==t&&(o+="<option>Zone "+a+"</option>");e.innerHTML=o,e.value=r||"None"}var aa=h({tag:"zone-sensor-card",render:Xt,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),a=t.querySelector(".zs-zigbee"),n=t.querySelector(".zs-ble"),i=t.querySelector(".zs-sync"),c=t.querySelector(".zs-row-zigbee"),g=t.querySelector(".zs-row-ble"),u=0;function m(){return S("selectedZone")}function b(){let x=m();u!==x&&(Yt(i,x),u=x);let z=_(s.probe(x)),k=_(s.tempSource(x))||"Local Probe",q=_(s.syncTo(x))||"None",Q=_(s.zigbee(x))||"",se=_(s.ble(x))||"";z&&(r.value=z),o.value=k,i.value=q,document.activeElement!==a&&(a.value=Q),document.activeElement!==n&&(n.value=se),c.style.display=k==="Zigbee MQTT"?"":"none",g.style.display=k==="BLE Sensor"?"":"none"}function w(x){let z=m();(x===s.probe(z)||x===s.tempSource(z)||x===s.syncTo(z)||x===s.zigbee(z)||x===s.ble(z))&&b()}r.addEventListener("change",()=>{X(m(),"zone_probe",r.value)}),o.addEventListener("change",()=>{X(m(),"zone_temp_source",o.value)}),i.addEventListener("change",()=>{X(m(),"zone_sync_to",i.value)}),a.addEventListener("change",()=>{oe(m(),"zone_zigbee_device",a.value)}),n.addEventListener("change",()=>{oe(m(),"zone_ble_mac",n.value)}),F("selectedZone",b);for(let x=1;x<=6;x++)p(s.probe(x),w),p(s.tempSource(x),w),p(s.syncTo(x),w),p(s.zigbee(x),w),p(s.ble(x),w);b()}});var Jt=`
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
`;y("zone-room-card",Jt);var Kt=()=>`
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
`,pa=h({tag:"zone-room-card",render:Kt,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),i=t.querySelectorAll(".wall-btn");function c(){return S("selectedZone")}function g(){let m=c();document.activeElement!==r&&(r.value=Z(m)||""),document.activeElement!==o&&(o.value=f(s.area(m))!=null?String(f(s.area(m))):""),document.activeElement!==a&&(a.value=f(s.spacing(m))!=null?String(f(s.spacing(m))):""),n.value=_(s.pipeType(m))||"Unknown";let b=_(s.exteriorWalls(m))||"None",w=b==="None"?[]:b.split(",").filter(Boolean);i.forEach(x=>{let z=x.dataset.wall;x.classList.toggle("active",z==="None"?w.length===0:w.includes(z))})}function u(m){let b=c();(m===s.area(b)||m===s.spacing(b)||m===s.pipeType(b)||m===s.exteriorWalls(b))&&g()}r.addEventListener("change",()=>{Re(c(),r.value)}),o.addEventListener("change",()=>{_e(c(),"zone_area_m2",o.value)}),a.addEventListener("change",()=>{_e(c(),"zone_pipe_spacing_mm",a.value||"200")}),n.addEventListener("change",()=>{X(c(),"zone_pipe_type",n.value)}),i.forEach(m=>{m.addEventListener("click",()=>{let b=m.dataset.wall,w=_(s.exteriorWalls(c()))||"None",x=w==="None"?[]:w.split(",").filter(Boolean);if(b==="None")x=[];else{let k=x.indexOf(b);k>=0?x.splice(k,1):x.push(b)}let z=["N","S","E","W"].filter(k=>x.includes(k));oe(c(),"zone_exterior_walls",z.length?z.join(","):"None")})}),F("selectedZone",g),F("zoneNames",g);for(let m=1;m<=6;m++)p(s.area(m),u),p(s.spacing(m),u),p(s.pipeType(m),u),p(s.exteriorWalls(m),u);g()}});var Qt=`
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
`;y("flow-diagram",Qt);var P=6,ot=[60,126,192,258,324,390],be=225,J=36,ne=160,ue=90,ae=J+ne,I=640,eo=11,Ee=6,Ne=24,Fe=I+20,Qe=I+210,et=I+328,tt=I+420,rt="#7D8BA7",at="#6C7892",to="#8FCBFF",oo="#BCDFFF",ro="#E4D092",ao="#F2B74C",no="#8FCBFF",so="#D8E7FF",io="#7D8BA7",lo="#B7CBF0",co="#6C7892",ge="#A3B6D9",po="#8EA4CD",mo="#42A5F5",uo="#66BB6A",go="#EF5350";function fe(e,t,r){var o=be+(e-2.5)*eo,a=ot[e],n=I-ae,i=ae+n*.33,c=ae+n*.67;return"M"+ae+" "+(o-t).toFixed(1)+" C"+i+" "+(o-t).toFixed(1)+" "+c+" "+(a-r).toFixed(1)+" "+I+" "+(a-r).toFixed(1)+" L"+I+" "+(a+r).toFixed(1)+" C"+c+" "+(a+r).toFixed(1)+" "+i+" "+(o+t).toFixed(1)+" "+ae+" "+(o+t).toFixed(1)+"Z"}function bo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function fo(e){let t=String(Z(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function vo(e,t){return t?e==null||Number.isNaN(e)?at:e<.15?to:e<.4?oo:e<.7?ro:ao:rt}function xo(){var e=1160,t=460,r=be-ue/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var a=1;a<=P;a++)o.push('<linearGradient id="rg'+a+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+a+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+a+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=P;n++){var i=fe(n-1,Ee,Ne);o.push('<path d="'+i+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=P;n++){var c=fe(n-1,Ee,Ne);o.push('<path id="fd-path-'+n+'" d="'+c+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+I+'" y1="36" x2="'+I+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var g=5,u=J-g;for(o.push('<rect x="0" y="'+r+'" width="'+u+'" height="'+ue+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+J+'" y="'+r+'" width="'+ne+'" height="'+ue+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(J+ne/2)+'" y="'+(be-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(J+ne/2)+'" y="'+(be+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(J+ne/2)+'" y="'+(r+ue+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Fe+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+Qe+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+et+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+tt+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=P;n++){var m=ot[n-1];o.push('<text id="fd-zn'+n+'" x="'+Fe+'" y="'+(m+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),o.push('<text id="fd-zf'+n+'" x="'+Fe+'" y="'+(m+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zt'+n+'" x="'+Qe+'" y="'+(m+10)+'" font-size="19" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+n+'" x="'+et+'" y="'+(m+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+n+'" x="'+tt+'" y="'+(m+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+po+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+P+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var ho=()=>`<div class="flow-wrap">${xo()}</div>`;h({tag:"flow-diagram",render:ho,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(P+1)};for(let a=1;a<=P;a++)r.zones[a]={textTemp:t.querySelector("#fd-zt"+a),textFlow:t.querySelector("#fd-zv"+a),textRet:t.querySelector("#fd-zr"+a),label:t.querySelector("#fd-zn"+a),friendly:t.querySelector("#fd-zf"+a),path:t.querySelector("#fd-path-"+a)};function o(){let a=f(l.flow),n=f(l.ret),i=r.flowEl,c=r.retEl,g=r.dtEl;if(i.textContent=L(a),c.textContent="RET "+L(n),a!=null&&n!=null){let u=Number(a)-Number(n);g.textContent=u.toFixed(1)+"\xB0C",g.setAttribute("fill",u<3?mo:u>8?go:uo)}else g.textContent="---";for(let u=1;u<=P;u++){let m=f(s.temp(u)),b=f(s.valve(u)),w=A(s.enabled(u)),x=String(_(s.tempSource(u))||"Local Probe"),z=bo(_(s.probe(u))||""),k=z?f(s.probeTemp(z)):null,q=r.zones[u],Q=q.textTemp,se=q.textFlow,ie=q.textRet,Ce=q.label,Me=q.friendly,B=q.path,ve=b!=null?Math.max(0,Math.min(100,Number(b)))/100:0;Ce.textContent="ZONE "+u;let lt=fo(u);if(Me.textContent=lt||"---",Ce.setAttribute("fill",w?so:io),Me.setAttribute("fill",w?lo:co),Q.textContent=L(m),se.textContent=$(b),se.setAttribute("fill",vo(ve,w)),x!=="Local Probe"&&k!=null&&!Number.isNaN(Number(k))?(ie.textContent=L(k),ie.setAttribute("fill",w?no:rt)):(ie.textContent="---",ie.setAttribute("fill",at)),!w)B.setAttribute("d",fe(u-1,1,2)),B.setAttribute("fill","#2A2D38"),B.setAttribute("opacity","0.4");else{let dt=Math.max(3,ve*Ne),ct=Math.max(1.5,ve*Ee);B.setAttribute("d",fe(u-1,ct,dt)),B.setAttribute("fill","url(#rg"+u+")"),B.setAttribute("opacity","1")}}}p(l.flow,o),p(l.ret,o),F("zoneNames",o);for(let a=1;a<=P;a++)p(s.temp(a),o),p(s.valve(a),o),p(s.enabled(a),o),p(s.probe(a),o),p(s.tempSource(a),o);for(let a=1;a<=8;a++)p(s.probeTemp(a),o);o()}});var yo=`
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
}`;y("diag-i2c",yo);var zo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,wa=h({tag:"diag-i2c",render:zo,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=S("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Ve()}),F("i2cResult",o),o()}});var wo=`
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
`;y("diag-zone",wo);function _o(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function nt(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function st(e){return e!=null?Number(e).toFixed(0):"---"}var So=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
  `},Ca=h({tag:"diag-zone",render:So,onMount(e,t){function r(o){let a=String(_(s.state(o))||"").toUpperCase()||"OFF",n=A(s.enabled(o)),i=t.querySelector('[data-dz-state="'+o+'"]');i.textContent=n?a:"OFF",i.className="dz-state-badge"+(n?" "+_o(a):""),t.querySelector('[data-dz-temp="'+o+'"]').textContent=L(f(s.temp(o))),t.querySelector('[data-dz-valve="'+o+'"]').textContent=$(f(s.valve(o))),t.querySelector('[data-dz-ret="'+o+'"]').textContent=L(f(l.ret)),t.querySelector('[data-dz-orip="'+o+'"]').textContent=st(f(s.motorOpenRipples(o))),t.querySelector('[data-dz-crip="'+o+'"]').textContent=st(f(s.motorCloseRipples(o))),t.querySelector('[data-dz-ofac="'+o+'"]').textContent=nt(f(s.motorOpenFactor(o))),t.querySelector('[data-dz-cfac="'+o+'"]').textContent=nt(f(s.motorCloseFactor(o)));let c=String(_(s.motorLastFault(o))||"").toUpperCase(),g=c&&c!=="NONE"&&c!=="OK",u=t.querySelector('[data-dz-faultrow="'+o+'"]');u.style.display=g?"flex":"none",g&&(t.querySelector('[data-dz-fault="'+o+'"]').textContent=c)}for(let o=1;o<=6;o++){let a=o,n=()=>r(a);p(s.state(a),n),p(s.enabled(a),n),p(s.temp(a),n),p(s.valve(a),n),p(l.ret,n),p(s.motorOpenRipples(a),n),p(s.motorCloseRipples(a),n),p(s.motorOpenFactor(a),n),p(s.motorCloseFactor(a),n),p(s.motorLastFault(a),n),r(a)}}});var ko=`
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
`;y("diag-activity",ko);var Fo=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function Eo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Aa=h({tag:"diag-activity",render:Fo,onMount(e,t){let r=t.querySelector(".diag-log");function o(){Eo(r,qe())}F("activityLog",o),o()}});var No=`
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
`;y("diag-manual-badge",No);var Co=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Ia=h({tag:"diag-manual-badge",render:Co,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let a=!!S("manualMode");r&&r.classList.toggle("on",a)}F("manualMode",o),o()}});var Mo=`
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
`;y("diag-zone-motor",Mo);var Lo=e=>{let t=e.zone||S("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Ua=h({tag:"diag-zone-motor-card",render:Lo,onMount(e,t){let r=Number(e.zone||S("selectedZone")||1),o=!!S("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),c=t.querySelector(".motor-target-input"),g=t.querySelector(".motor-open-btn"),u=t.querySelector(".motor-close-btn"),m=t.querySelector(".motor-stop-btn");function b(z){o=!!z,a&&(a.classList.toggle("on",o),a.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[i,c,g,u,m].forEach(k=>{k&&(k.disabled=!o)})}function w(){let z=!o;if(b(z),z){ke(!0);for(let k=1;k<=6;k++)Se(k)}else ke(!1)}function x(){let z=f(s.motorTarget(r));c&&z!=null?c.value=Number(z).toFixed(0):c&&(c.value="0")}i==null||i.addEventListener("change",()=>{r=Number(i.value||1),x()}),a==null||a.addEventListener("click",w),a==null||a.addEventListener("keydown",z=>{z.key!==" "&&z.key!=="Enter"||(z.preventDefault(),w())});for(let z=1;z<=6;z++)p(s.motorTarget(z),x);x(),b(o),F("manualMode",()=>{b(!!S("manualMode"))}),c==null||c.addEventListener("change",z=>{if(!o)return;let k=z.target.value;je(r,k)}),g==null||g.addEventListener("click",()=>{o&&Ue(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Ge(r,1e4)}),m==null||m.addEventListener("click",()=>{o&&Se(r)})}});var Do=`
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
`;y("diag-zone-recovery",Do);var Oo=e=>{let t=e.zone||S("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Ka=h({tag:"diag-zone-recovery-card",render:Oo,onMount(e,t){let r=Number(e.zone||S("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),a=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),a==null||a.addEventListener("click",()=>{$e(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&Xe(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&Ye(r)})}});var Ao=`
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
`;y("settings-manifold-card",Ao);var To=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},sn=h({tag:"settings-manifold-card",render:To,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret");function n(){r.value=_(l.manifoldType)||"NC (Normally Closed)",o.value=_(l.manifoldFlowProbe)||"Probe 7",a.value=_(l.manifoldReturnProbe)||"Probe 8";for(let i=1;i<=8;i++){let c=t.querySelector('[data-probe="'+i+'"]'),g=f(s.probeTemp(i));c&&(c.textContent=L(g))}}r.addEventListener("change",()=>Y("manifold_type",r.value)),o.addEventListener("change",()=>Y("manifold_flow_probe",o.value)),a.addEventListener("change",()=>Y("manifold_return_probe",a.value)),p(l.manifoldType,n),p(l.manifoldFlowProbe,n),p(l.manifoldReturnProbe,n);for(let i=1;i<=8;i++)p(s.probeTemp(i),n);n()}});var Ro=`
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
`;y("settings-control-card",Ro);var qo=()=>`
  <div class="settings-control-card">
    <div class="card-title">Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,mn=h({tag:"settings-control-card",render:qo,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{R("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{R("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{R("restart")})}});var Po=`
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
`;y("settings-motor-calibration-card",Po);var K=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:l.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:l.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:l.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:l.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:l.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:l.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:l.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Io=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<K.length;r++){let o=K[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function Zo(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"}function it(e,t){let r=Number(t);return Number.isFinite(r)?Zo(e)?String(Math.round(r)):r.toFixed(2):"0"}var hn=h({tag:"settings-motor-calibration-card",render:Io,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function a(i){if(i==="HmIP VdMot"&&re("hmip_runtime_limit_seconds",40),i==="Generic"){let c=Number(f(l.genericRuntimeLimitSeconds));(!Number.isFinite(c)||c<=0)&&re("generic_runtime_limit_seconds",45)}}function n(){let i=_(l.motorProfileDefault)||"HmIP VdMot";r&&(r.value=i),o&&(i==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=it("generic_runtime_limit_seconds",f(l.genericRuntimeLimitSeconds)),o.disabled=!1));for(let c=0;c<K.length;c++){let g=K[c],u=t.querySelector(".smc-"+g.cls);u&&g.key!=="generic_runtime_limit_seconds"&&(u.value=it(g.key,f(g.id)))}}r&&(r.addEventListener("change",()=>{Y("motor_profile_default",r.value),a(r.value)}),p(l.motorProfileDefault,n));for(let i=0;i<K.length;i++){let c=K[i],g=t.querySelector(".smc-"+c.cls);g&&(g.addEventListener("change",()=>{if(c.key==="generic_runtime_limit_seconds"){if((_(l.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;re("generic_runtime_limit_seconds",g.value);return}re(c.key,g.value)}),p(c.id,n))}p(l.genericRuntimeLimitSeconds,n),p(l.hmipRuntimeLimitSeconds,n),a(_(l.motorProfileDefault)||"HmIP VdMot"),n()}});var Ho=`
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
`;y("app-root",Ho);var Bo=e=>`
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
`;h({tag:"app-root",render:Bo,onMount(e,t){t.querySelector(".hdr").appendChild(C("hv6-header")),t.querySelector(".overview-flow").appendChild(C("flow-diagram")),t.querySelector(".overview-status").appendChild(C("status-card")),t.querySelector(".overview-connectivity").appendChild(C("connectivity-card")),t.querySelector(".overview-graphs").appendChild(C("graph-widgets")),t.querySelector(".zone-selector").appendChild(C("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(C("zone-detail",{zone:S("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(C("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(C("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(C("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(C("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(C("settings-motor-calibration-card")),t.querySelector(".diag-manual-badge-slot").appendChild(C("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(C("diag-i2c")),r.appendChild(C("diag-activity")),r.appendChild(C("diag-zone"));let o=S("selectedZone")||1;r.appendChild(C("diag-zone-motor-card",{zone:o})),r.appendChild(C("diag-zone-recovery-card",{zone:o}));let a=t.querySelectorAll(".sec");function n(){let i=S("section");a.forEach(c=>{c.classList.toggle("active",c.getAttribute("data-section")===i)})}F("section",n),n()}});function Wo(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(C("app-root")),ze()}Wo();})();

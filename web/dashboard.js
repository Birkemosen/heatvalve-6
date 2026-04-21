(()=>{var Ne={},ie={};function h(e){return Ne[e.tag]=e,e}function M(e,t){let r=Ne[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let l=r.state(t||{});for(let d in l)o[d]=l[d]}if(r.methods)for(let l in r.methods)o[l]=r.methods[l];let n=document.createElement("div");n.innerHTML=r.render(o);let a=n.firstElementChild;return r.onMount&&r.onMount(o,a),a}function p(e,t){(ie[e]||(ie[e]=[])).push(t)}function A(e){let t=ie[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var H=6,mt=28,le=Object.create(null),gt=bt(),C={section:"overview",selectedZone:1,live:!1,pendingWrites:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:ft(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:gt,manualMode:!1};function ft(){let e=Object.create(null);for(let t=1;t<=H;t++)e[t]=[];return e}function bt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<H;)e.push("");return e.slice(0,H)}function vt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(C.zoneNames))}catch(e){}}function O(e){return"$dashboard:"+e}function de(e){return Math.max(1,Math.min(H,Number(e)||1))}function De(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function b(e){let t=le[e];return t?t.v!=null?t.v:t.value!=null?t.value:De(t.s!=null?t.s:t.state):null}function _(e){let t=le[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function xt(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function T(e){return xt(_(e))}function c(e,t){let r=le[e];r||(r=le[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);A(e),e==="text_sensor-firmware_version"&&W("firmwareVersion",_(e)||"")}function F(e,t){p(O(e),t)}function k(e){return C[e]}function W(e,t){C[e]=t,A(O(e))}function Ae(e){C.section!==e&&(C.section=e,A(O("section")))}function Oe(e){let t=de(e);C.selectedZone!==t&&(C.selectedZone=t,A(O("selectedZone")))}function j(e){let t=!!e;C.live!==t&&(C.live=t,A(O("live")))}function Te(){C.pendingWrites+=1,A(O("pendingWrites"))}function he(){C.pendingWrites=Math.max(0,C.pendingWrites-1),A(O("pendingWrites"))}function Re(e,t){let r=de(e)-1;C.zoneNames[r]=String(t||"").trim(),vt(),A(O("zoneNames"))}function Z(e){return C.zoneNames[de(e)-1]||""}function V(e){let t=de(e),r=Z(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function G(e){C.i2cResult=e||"No scan has been run yet.",A(O("i2cResult"))}function y(e,t){let r={time:ht(),msg:String(e||"")};for(C.activityLog.push(r);C.activityLog.length>60;)C.activityLog.shift();if(t>=1&&t<=H){let o=C.zoneLog[t];for(o.push(r);o.length>8;)o.shift();A(O("zoneLog:"+t))}A(O("activityLog"))}function qe(e){return e>=1&&e<=H?C.zoneLog[e]:C.activityLog}function xe(e,t){let r=C[e];if(!Array.isArray(r))return;let o=De(t);if(o!=null){for(r.push(o);r.length>mt;)r.shift();A(O(e))}}function K(e){let t=Date.now();if(!e&&t-C.lastHistoryAt<3200)return;C.lastHistoryAt=t;let r=0,o=0;for(let n=1;n<=H;n++){let a=b("sensor-zone_"+n+"_valve_pct");a!=null&&(r+=a,o+=1)}xe("historyFlow",b("sensor-manifold_flow_temperature")),xe("historyReturn",b("sensor-manifold_return_temperature")),xe("historyDemand",o?r/o:0)}function ht(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}var s={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},i={flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"select-simple_preheat_enabled"};var L=6,yt=8,Pe=null,Q=0,v={temp:new Float32Array(L),setpoint:new Float32Array(L),valve:new Float32Array(L),enabled:new Uint8Array(L),driversEnabled:1,fault:0,manualMode:0};function wt(){v.manualMode=0,W("manualMode",!1);for(let e=0;e<L;e++){v.temp[e]=20.5+e*.4,v.setpoint[e]=21+e%3*.5,v.valve[e]=12+e*8,v.enabled[e]=e===4?0:1;let t=e+1;c(s.temp(t),{value:v.temp[e]}),c(s.setpoint(t),{value:v.setpoint[e]}),c(s.valve(t),{value:v.valve[e]}),c(s.state(t),{state:v.valve[e]>5?"heating":"idle"}),c(s.enabled(t),{value:!!v.enabled[e],state:v.enabled[e]?"on":"off"}),c(s.probe(t),{state:"Probe "+t}),c(s.tempSource(t),{state:t%2?"Local Probe":"BLE Sensor"}),c(s.syncTo(t),{state:"None"}),c(s.pipeType(t),{state:"PEX 16mm"}),c(s.area(t),{value:8+t*3.5}),c(s.spacing(t),{value:[150,200,150,100,200,150][e]}),c(s.zigbee(t),{state:"zone_"+t+"_mock_sensor"}),c(s.ble(t),{state:"AA:BB:CC:DD:EE:0"+t}),c(s.exteriorWalls(t),{state:["N","E","S","W","N,E","S,W"][e]}),c(s.preheatAdvance(t),{value:.08+e*.03})}for(let e=1;e<=yt;e++){let t=e<=L?e:L,r=v.temp[t-1]+(e>L?1:.1*e);c(s.probeTemp(e),{value:r})}c(i.flow,{value:34.1}),c(i.ret,{value:30.4}),c(i.uptime,{value:18*3600+720}),c(i.wifi,{value:-57}),c(i.drivers,{value:!0,state:"on"}),c(i.fault,{value:!1,state:"off"}),c(i.ip,{state:"192.168.1.86"}),c(i.ssid,{state:"MockLab"}),c(i.mac,{state:"D8:3B:DA:12:34:56"}),c(i.firmware,{state:"0.5.x-mock"}),c(i.manifoldFlowProbe,{state:"Probe 7"}),c(i.manifoldReturnProbe,{state:"Probe 8"}),c(i.manifoldType,{state:"NC (Normally Closed)"}),c(i.motorProfileDefault,{state:"HmIP VdMot"}),c(i.closeThresholdMultiplier,{value:1.7}),c(i.closeSlopeThreshold,{value:1}),c(i.closeSlopeCurrentFactor,{value:1.4}),c(i.openThresholdMultiplier,{value:1.7}),c(i.openSlopeThreshold,{value:.8}),c(i.openSlopeCurrentFactor,{value:1.3}),c(i.openRippleLimitFactor,{value:1}),c(i.genericRuntimeLimitSeconds,{value:45}),c(i.hmipRuntimeLimitSeconds,{value:40}),c(i.relearnAfterMovements,{value:2e3}),c(i.relearnAfterHours,{value:168}),c(i.learnedFactorMinSamples,{value:3}),c(i.learnedFactorMaxDeviationPct,{value:12}),c(i.simplePreheatEnabled,{state:"on"}),K(!0)}function zt(){Q+=1,c(i.uptime,{value:Number(Date.now()/1e3)|0}),c(i.wifi,{value:-55-Math.round((1+Math.sin(Q/4))*6)});let e=0,t=0,r=0;for(let a=0;a<L;a++){let l=a+1,d=!!v.enabled[a],g=v.temp[a],m=v.setpoint[a],u=d&&v.driversEnabled&&!v.manualMode&&g<m-.25;v.manualMode?v.valve[a]=Math.max(0,v.valve[a]):!d||!v.driversEnabled?v.valve[a]=Math.max(0,v.valve[a]-6):u?v.valve[a]=Math.min(100,v.valve[a]+7+l%3):v.valve[a]=Math.max(0,v.valve[a]-5);let f=u?.05+v.valve[a]/2200:-.03+v.valve[a]/3200;v.temp[a]=g+f+Math.sin((Q+l)/5)*.04,d&&v.valve[a]>0&&(e+=v.valve[a],t+=1,r=Math.max(r,v.valve[a])),c(s.temp(l),{value:v.temp[a]}),c(s.valve(l),{value:Math.round(v.valve[a])});let S=Math.max(0,(v.setpoint[a]-v.temp[a]-.15)*.22);c(s.preheatAdvance(l),{value:Number(S.toFixed(2))}),c(s.state(l),{state:d?u?"heating":"idle":"off"}),c(s.enabled(l),{value:d,state:d?"on":"off"}),c(s.probeTemp(l),{value:v.temp[a]+Math.sin((Q+l)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(Q/6)*.25,n=o-(t?2.1+e/Math.max(1,t*50):1.1);c(i.flow,{value:Number(o.toFixed(1))}),c(i.ret,{value:Number(n.toFixed(1))}),c(s.probeTemp(7),{value:Number((n-.4).toFixed(1))}),c(s.probeTemp(8),{value:Number((o+.2).toFixed(1))}),K(!0)}function Ze(){Pe||(wt(),j(!0),Pe=setInterval(zt,1200))}function ce(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=L){let a=Number(r);Number.isNaN(a)||(v.setpoint[o-1]=a,c(s.setpoint(o),{value:a}),y("Zone "+o+" setpoint set to "+a.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=L){let a=r>.5;v.enabled[o-1]=a?1:0,c(s.enabled(o),{value:a,state:a?"on":"off"}),y("Zone "+o+(a?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let a=r>.5;v.driversEnabled=a?1:0,c(i.drivers,{value:a,state:a?"on":"off"}),y(a?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let a=r>.5;v.manualMode=a?1:0,W("manualMode",a);return}if(t==="motor_target"&&o>=1&&o<=L){let a=Number(r||0);c(s.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(a)))}),y("Motor "+o+" target set to "+a+"%",o);return}if(t==="command"){let a=String(r);if(a==="i2c_scan"){G(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),y("I2C scan complete");return}if(a==="calibrate_all_motors"||a==="restart"){y("Command executed: "+a);return}if(a==="open_motor_timed"&&o>=1&&o<=L){y("Motor "+o+" open timed",o);return}if(a==="close_motor_timed"&&o>=1&&o<=L){y("Motor "+o+" close timed",o);return}if(a==="stop_motor"&&o>=1&&o<=L){y("Motor "+o+" stopped",o);return}if(a==="motor_reset_fault"&&o>=1&&o<=L){y("Motor "+o+" fault reset",o);return}if(a==="motor_reset_learned_factors"&&o>=1&&o<=L){y("Motor "+o+" learned factors reset",o);return}if(a==="motor_reset_and_relearn"&&o>=1&&o<=L){y("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){c(s.probe(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){c(s.tempSource(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){c(s.syncTo(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){c(s.pipeType(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){c(i.manifoldType,{state:String(r)}),y("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){c(i.manifoldFlowProbe,{state:String(r)}),y("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){c(i.manifoldReturnProbe,{state:String(r)}),y("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){c(i.motorProfileDefault,{state:String(r)}),y("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){c(i.simplePreheatEnabled,{state:String(r)}),y("Setting updated: "+t+" = "+r);return}if(t==="zone_zigbee_device"&&o>=1){c(s.zigbee(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_ble_mac"&&o>=1){c(s.ble(o),{state:String(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){c(s.exteriorWalls(o),{state:String(r)||"None"}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){c(s.area(o),{value:Number(r)}),y("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){c(s.spacing(o),{value:Number(r)}),y("Setting updated: "+t+" = "+r,o);return}let n={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct};if(n[t]){let a=Number(r);Number.isNaN(a)||(c(n[t],{value:a}),y("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){ce({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!v.enabled[e-1];ce({key:"zone_enabled",value:t?1:0,zone:e})}};var ye=null,pe=null;async function _t(){pe&&pe.abort(),pe=new AbortController;let e=await fetch("/dashboard/state",{cache:"no-store",signal:pe.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function Ie(e){if(!(!e||typeof e!="object")){for(let t in e)c(t,e[t]);K(!1)}}function St(e){if(e){if(!e.type){Ie(e);return}if(e.type==="state"){Ie(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;y(t),String(t).indexOf("I2C_SCAN:")!==-1&&G(String(t))}}}function He(){ye||(ye=setTimeout(()=>{ye=null,we()},1e3))}function we(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Ze();return}_t().then(t=>{j(!0),St(t),He()}).catch(()=>{j(!1),He()})}var Be=Object.create(null);function w(e,t){if(Be[e])return;Be[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function D(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function $(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function ue(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function We(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var kt=`
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
`;w("hv6-header",kt);var Et=()=>`
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
`,pr=h({tag:"hv6-header",render:Et,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),n=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),l=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function m(){let f=k("section");g.forEach(S=>{S.classList.toggle("active",S.getAttribute("data-section")===f)})}function u(){let f=k("live"),S=k("pendingWrites"),x=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":f?"Live":"Offline";r.textContent=x,o.classList.toggle("on",!!f),n.textContent=S>0?"Saving...":f?"Synced":"Offline";let z=S>0?"saving":f?"synced":"offline";n.className="meta-chip meta-chip-state "+z,a.textContent=ue(b(i.uptime)),l.textContent=We(b(i.wifi));let E=k("firmwareVersion")||_(i.firmware);d.textContent=E?"FW "+E:""}g.forEach(f=>{f.addEventListener("click",S=>{S.preventDefault(),Ae(f.getAttribute("data-section"))})}),F("section",m),F("live",u),F("pendingWrites",u),F("firmwareVersion",u),p(i.uptime,u),p(i.wifi,u),p(i.firmware,u),m(),u()}});var Ft="/dashboard";function Ct(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function N(e){if(Te(),Ct())try{return ce(e),Promise.resolve({ok:!0})}finally{he()}return fetch(Ft+"/set",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:(()=>{let t=new URLSearchParams;for(let[r,o]of Object.entries(e))o!=null&&t.append(r,o);return t.toString()})()}).finally(()=>{he()})}function ze(e,t){return c(s.setpoint(e),{value:t}),N({key:"zone_setpoint",value:t,zone:e})}function je(e,t){return c(s.enabled(e),{state:t?"on":"off",value:t}),N({key:"zone_enabled",value:t?1:0,zone:e})}function Ve(e){return c(i.drivers,{state:e?"on":"off",value:e}),N({key:"drivers_enabled",value:e?1:0})}function ee(e,t){return N({key:"command",value:e,zone:t||void 0})}function Ge(){return G("Scanning I2C bus..."),y("I2C scan started"),ee("i2c_scan")}var Mt={zone_probe:e=>s.probe(e),zone_temp_source:e=>s.tempSource(e),zone_sync_to:e=>s.syncTo(e),zone_pipe_type:e=>s.pipeType(e)},Lt={zone_zigbee_device:e=>s.zigbee(e),zone_ble_mac:e=>s.ble(e),zone_exterior_walls:e=>s.exteriorWalls(e)},Nt={zone_area_m2:e=>s.area(e),zone_pipe_spacing_mm:e=>s.spacing(e)},Dt={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled},At={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct};function U(e,t,r){let o=Mt[t];return o&&c(o(e),{state:r}),N({key:t,value:r,zone:e})}function te(e,t,r){let o=Lt[t];return o&&c(o(e),{state:r}),N({key:t,value:r,zone:e})}function _e(e,t,r){let o=Number(r),n=Nt[t];return n&&!Number.isNaN(o)&&c(n(e),{value:o}),N({key:t,value:o,zone:e})}function I(e,t){let r=Dt[e];return r&&c(r,{state:t}),N({key:e,value:t})}function oe(e,t){let r=Number(t),o=At[e];return o&&!Number.isNaN(r)&&c(o,{value:r}),N({key:e,value:r})}function $e(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return c(s.motorTarget(e),{value:o}),y("Motor "+e+" target set to "+o+"%",e),N({key:"motor_target",value:o,zone:e})}function Ue(e,t=1e4){return y("Motor "+e+" open for "+t+"ms",e),N({key:"command",value:"open_motor_timed",zone:e})}function Xe(e,t=1e4){return y("Motor "+e+" close for "+t+"ms",e),N({key:"command",value:"close_motor_timed",zone:e})}function Se(e){return y("Motor "+e+" stopped",e),N({key:"command",value:"stop_motor",zone:e})}function ke(e){return W("manualMode",!!e),y(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),N({key:"manual_mode",value:e?1:0})}function Ye(e){return y("Motor "+e+" fault reset",e),N({key:"command",value:"motor_reset_fault",zone:e})}function Je(e){return y("Motor "+e+" learned factors reset",e),N({key:"command",value:"motor_reset_learned_factors",zone:e})}function Ke(e){return y("Motor "+e+" reset and relearn started",e),N({key:"command",value:"motor_reset_and_relearn",zone:e})}var Ot=`
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
`;w("status-card",Ot);var Tt=e=>`
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
`,zr=h({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Tt,methods:{update(e){this.motorDriversOn=T(i.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=T(i.fault)?"FAULT":"OK",this.connOn=k("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);p(i.drivers,o),p(i.fault,o),F("live",o),r.sw.onclick=()=>{Ve(!e.motorDriversOn)},o()}});var Rt=`
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
`;w("connectivity-card",Rt);var qt=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Mr=h({tag:"connectivity-card",render:qt,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),n=t.querySelector(".cc-mac"),a=t.querySelector(".cc-up");function l(){r.textContent=_(i.ip)||"---",o.textContent=_(i.ssid)||"---",n.textContent=_(i.mac)||"---",a.textContent=ue(b(i.uptime))}p(i.ip,l),p(i.ssid,l),p(i.mac,l),p(i.uptime,l),l()}});var Pt=`
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
`;w("graph-widgets",Pt);var Zt=()=>`
  <div class="graph-widgets">
    <div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div>
    <div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div>
  </div>
`;function Qe(e,t,r,o){if(!e.length)return"";let n=Math.min.apply(null,e),a=Math.max.apply(null,e),l=Math.max(.001,a-n),d=e.length>1?(t-o*2)/(e.length-1):0,g="";for(let m=0;m<e.length;m++){let u=o+d*m,f=r-o-(e[m]-n)/l*(r-o*2);g+=(m?" L ":"M ")+u.toFixed(2)+" "+f.toFixed(2)}return g}function et(e,t,r,o,n){e.innerHTML="";let a=Qe(t,220,56,5);if(a){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",a),d.setAttribute("fill","none"),d.setAttribute("stroke",r),d.setAttribute("stroke-width","2.2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}let l=o&&o.length?Qe(o,220,56,5):"";if(l){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",l),d.setAttribute("fill","none"),d.setAttribute("stroke",n),d.setAttribute("stroke-width","2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}}var It="var(--accent)",Ht="var(--blue)",Bt="var(--blue)",Or=h({tag:"graph-widgets",render:Zt,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),n=t.querySelector(".gw-flow"),a=t.querySelector(".gw-demand");function l(){let d=k("historyFlow"),g=k("historyReturn"),m=k("historyDemand"),u=d.length?d[d.length-1]:null,f=g.length?g[g.length-1]:null,S=m.length?m[m.length-1]:null;r.textContent=u!=null&&f!=null?(u-f).toFixed(1)+" C":"---",o.textContent=S!=null?Math.round(S)+"%":"---",et(n,d,It,g,Ht),et(a,m,Bt)}F("historyFlow",l),F("historyReturn",l),F("historyDemand",l),l()}});var Wt=`
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
`;w("zone-grid",Wt);var jt=()=>'<div class="zone-grid"></div>',Pr=h({tag:"zone-grid",render:jt,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(M("zone-card",{zone:r}))}});var Vt=`
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
`;w("zone-card",Vt);var Gt=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${V(e.zone)}</div>
		<div class="zc-friendly">${Z(e.zone)||"---"}</div>
	</div>
`,Vr=h({tag:"zone-card",state:e=>({zone:e.zone}),render:Gt,onMount(e,t){let r=e.zone,o=s.temp(r),n=s.state(r),a=s.enabled(r),l=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),g=t.querySelector(".zc-zone-name"),m=t.querySelector(".zc-friendly");function u(){let f=T(a),S=String(_(n)||"").toUpperCase()||"OFF",x=k("selectedZone")===r,z=Z(r);g.textContent=V(r),m.textContent=z||D(b(o)),l.textContent=f?S:"OFF";let E=f?S:"OFF",R=E==="HEATING"?"#f2c77b":E==="IDLE"?"#79d17e":E==="FAULT"?"#ff7676":"#7D8BA7",J=E==="HEATING"?"#EEA111":E==="IDLE"?"#79d17e":E==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";l.style.color=R,d.style.background=J,d.style.boxShadow=E==="HEATING"?"0 0 5px rgba(238,161,17,.6)":E==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",x),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&S==="HEATING"),t.classList.toggle("zs-idle",f&&S!=="HEATING"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{Oe(r)}),p(o,u),p(n,u),p(a,u),F("selectedZone",u),F("zoneNames",u),u()}});var $t=`
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
`;w("zone-detail",$t);var Ut=e=>`
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
`,Qr=h({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Ut,methods:{update(e,t){let r=k("selectedZone"),o=String(_(s.state(r))||"").toUpperCase(),n=T(s.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=V(r),t.setpoint.textContent=D(b(s.setpoint(r))),t.temp.textContent=D(b(s.temp(r))),t.ret.textContent=D(b("sensor-manifold_return_temperature")),t.valve.textContent=$(b(s.valve(r)));let a=t.badge;a.textContent=n?o||"IDLE":"DISABLED";let l=n?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";a.className="zd-badge"+(l?" "+l:""),t.toggle.classList.toggle("on",n)},incSetpoint(){let e=this.zone,t=b(s.setpoint(e))||20;ze(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=b(s.setpoint(e))||20;ze(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=T(s.enabled(e));je(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),n=a=>{let l=k("selectedZone");(a===s.temp(l)||a===s.setpoint(l)||a===s.valve(l)||a===s.state(l)||a===s.enabled(l))&&o()};for(let a=1;a<=6;a++)p(s.temp(a),n),p(s.setpoint(a),n),p(s.valve(a),n),p(s.state(a),n),p(s.enabled(a),n);p("sensor-manifold_return_temperature",o),F("selectedZone",o),o()}});var Xt=`
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
`;w("zone-sensor-card",Xt);var Yt=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
  `};function Jt(e,t){let r=e.value,o="<option>None</option>";for(let n=1;n<=6;n++)n!==t&&(o+="<option>Zone "+n+"</option>");e.innerHTML=o,e.value=r||"None"}var sa=h({tag:"zone-sensor-card",render:Yt,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),n=t.querySelector(".zs-zigbee"),a=t.querySelector(".zs-ble"),l=t.querySelector(".zs-sync"),d=t.querySelector(".zs-row-zigbee"),g=t.querySelector(".zs-row-ble"),m=0;function u(){return k("selectedZone")}function f(){let x=u();m!==x&&(Jt(l,x),m=x);let z=_(s.probe(x)),E=_(s.tempSource(x))||"Local Probe",R=_(s.syncTo(x))||"None",J=_(s.zigbee(x))||"",ne=_(s.ble(x))||"";z&&(r.value=z),o.value=E,l.value=R,document.activeElement!==n&&(n.value=J),document.activeElement!==a&&(a.value=ne),d.style.display=E==="Zigbee MQTT"?"":"none",g.style.display=E==="BLE Sensor"?"":"none"}function S(x){let z=u();(x===s.probe(z)||x===s.tempSource(z)||x===s.syncTo(z)||x===s.zigbee(z)||x===s.ble(z))&&f()}r.addEventListener("change",()=>{U(u(),"zone_probe",r.value)}),o.addEventListener("change",()=>{U(u(),"zone_temp_source",o.value)}),l.addEventListener("change",()=>{U(u(),"zone_sync_to",l.value)}),n.addEventListener("change",()=>{te(u(),"zone_zigbee_device",n.value)}),a.addEventListener("change",()=>{te(u(),"zone_ble_mac",a.value)}),F("selectedZone",f);for(let x=1;x<=6;x++)p(s.probe(x),S),p(s.tempSource(x),S),p(s.syncTo(x),S),p(s.zigbee(x),S),p(s.ble(x),S);f()}});var Kt=`
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
`;w("zone-room-card",Kt);var Qt=()=>`
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
`,ma=h({tag:"zone-room-card",render:Qt,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),n=t.querySelector(".zr-spacing"),a=t.querySelector(".zr-pipe"),l=t.querySelectorAll(".wall-btn");function d(){return k("selectedZone")}function g(){let u=d();document.activeElement!==r&&(r.value=Z(u)||""),document.activeElement!==o&&(o.value=b(s.area(u))!=null?String(b(s.area(u))):""),document.activeElement!==n&&(n.value=b(s.spacing(u))!=null?String(b(s.spacing(u))):""),a.value=_(s.pipeType(u))||"Unknown";let f=_(s.exteriorWalls(u))||"None",S=f==="None"?[]:f.split(",").filter(Boolean);l.forEach(x=>{let z=x.dataset.wall;x.classList.toggle("active",z==="None"?S.length===0:S.includes(z))})}function m(u){let f=d();(u===s.area(f)||u===s.spacing(f)||u===s.pipeType(f)||u===s.exteriorWalls(f))&&g()}r.addEventListener("change",()=>{Re(d(),r.value)}),o.addEventListener("change",()=>{_e(d(),"zone_area_m2",o.value)}),n.addEventListener("change",()=>{_e(d(),"zone_pipe_spacing_mm",n.value||"200")}),a.addEventListener("change",()=>{U(d(),"zone_pipe_type",a.value)}),l.forEach(u=>{u.addEventListener("click",()=>{let f=u.dataset.wall,S=_(s.exteriorWalls(d()))||"None",x=S==="None"?[]:S.split(",").filter(Boolean);if(f==="None")x=[];else{let E=x.indexOf(f);E>=0?x.splice(E,1):x.push(f)}let z=["N","S","E","W"].filter(E=>x.includes(E));te(d(),"zone_exterior_walls",z.length?z.join(","):"None")})}),F("selectedZone",g),F("zoneNames",g);for(let u=1;u<=6;u++)p(s.area(u),m),p(s.spacing(u),m),p(s.pipeType(u),m),p(s.exteriorWalls(u),m);g()}});var eo=`
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
`;w("flow-diagram",eo);var q=6,at=[60,126,192,258,324,390],fe=225,X=36,ae=160,me=90,re=X+ae,P=640,to=11,Fe=6,Ce=24,Ee=P+20,tt=P+210,ot=P+328,rt=P+420,nt="#7D8BA7",st="#6C7892",oo="#8FCBFF",ro="#BCDFFF",ao="#E4D092",no="#F2B74C",so="#8FCBFF",io="#D8E7FF",lo="#7D8BA7",co="#B7CBF0",po="#6C7892",ge="#A3B6D9",uo="#8EA4CD",mo="#42A5F5",go="#66BB6A",fo="#EF5350";function be(e,t,r){var o=fe+(e-2.5)*to,n=at[e],a=P-re,l=re+a*.33,d=re+a*.67;return"M"+re+" "+(o-t).toFixed(1)+" C"+l+" "+(o-t).toFixed(1)+" "+d+" "+(n-r).toFixed(1)+" "+P+" "+(n-r).toFixed(1)+" L"+P+" "+(n+r).toFixed(1)+" C"+d+" "+(n+r).toFixed(1)+" "+l+" "+(o+t).toFixed(1)+" "+re+" "+(o+t).toFixed(1)+"Z"}function bo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function vo(e){let t=String(Z(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function xo(e,t){return t?e==null||Number.isNaN(e)?st:e<.15?oo:e<.4?ro:e<.7?ao:no:nt}function ho(){var e=1160,t=460,r=fe-me/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var n=1;n<=q;n++)o.push('<linearGradient id="rg'+n+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+n+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+n+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var a=1;a<=q;a++){var l=be(a-1,Fe,Ce);o.push('<path d="'+l+'" fill="#1E2233" opacity="0.9"/>')}for(a=1;a<=q;a++){var d=be(a-1,Fe,Ce);o.push('<path id="fd-path-'+a+'" d="'+d+'" fill="url(#rg'+a+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+P+'" y1="36" x2="'+P+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var g=5,m=X-g;for(o.push('<rect x="0" y="'+r+'" width="'+m+'" height="'+me+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+X+'" y="'+r+'" width="'+ae+'" height="'+me+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(X+ae/2)+'" y="'+(fe-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(X+ae/2)+'" y="'+(fe+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(X+ae/2)+'" y="'+(r+me+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Ee+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+tt+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+ot+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+rt+'" y="34" font-size="11" fill="'+ge+'" font-weight="700" letter-spacing="2">RET</text>'),a=1;a<=q;a++){var u=at[a-1];o.push('<text id="fd-zn'+a+'" x="'+Ee+'" y="'+(u+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+a+"</text>"),o.push('<text id="fd-zf'+a+'" x="'+Ee+'" y="'+(u+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zt'+a+'" x="'+tt+'" y="'+(u+10)+'" font-size="19" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+a+'" x="'+ot+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+a+'" x="'+rt+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+uo+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+q+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var yo=()=>`<div class="flow-wrap">${ho()}</div>`;h({tag:"flow-diagram",render:yo,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(q+1)};for(let n=1;n<=q;n++)r.zones[n]={textTemp:t.querySelector("#fd-zt"+n),textFlow:t.querySelector("#fd-zv"+n),textRet:t.querySelector("#fd-zr"+n),label:t.querySelector("#fd-zn"+n),friendly:t.querySelector("#fd-zf"+n),path:t.querySelector("#fd-path-"+n)};function o(){let n=b(i.flow),a=b(i.ret),l=r.flowEl,d=r.retEl,g=r.dtEl;if(l.textContent=D(n),d.textContent="RET "+D(a),n!=null&&a!=null){let m=Number(n)-Number(a);g.textContent=m.toFixed(1)+"\xB0C",g.setAttribute("fill",m<3?mo:m>8?fo:go)}else g.textContent="---";for(let m=1;m<=q;m++){let u=b(s.temp(m)),f=b(s.valve(m)),S=T(s.enabled(m)),x=String(_(s.tempSource(m))||"Local Probe"),z=bo(_(s.probe(m))||""),E=z?b(s.probeTemp(z)):null,R=r.zones[m],J=R.textTemp,ne=R.textFlow,se=R.textRet,Me=R.label,Le=R.friendly,B=R.path,ve=f!=null?Math.max(0,Math.min(100,Number(f)))/100:0;Me.textContent="ZONE "+m;let ct=vo(m);if(Le.textContent=ct||"---",Me.setAttribute("fill",S?io:lo),Le.setAttribute("fill",S?co:po),J.textContent=D(u),ne.textContent=$(f),ne.setAttribute("fill",xo(ve,S)),x!=="Local Probe"&&E!=null&&!Number.isNaN(Number(E))?(se.textContent=D(E),se.setAttribute("fill",S?so:nt)):(se.textContent="---",se.setAttribute("fill",st)),!S)B.setAttribute("d",be(m-1,1,2)),B.setAttribute("fill","#2A2D38"),B.setAttribute("opacity","0.4");else{let pt=Math.max(3,ve*Ce),ut=Math.max(1.5,ve*Fe);B.setAttribute("d",be(m-1,ut,pt)),B.setAttribute("fill","url(#rg"+m+")"),B.setAttribute("opacity","1")}}}p(i.flow,o),p(i.ret,o),F("zoneNames",o);for(let n=1;n<=q;n++)p(s.temp(n),o),p(s.valve(n),o),p(s.enabled(n),o),p(s.probe(n),o),p(s.tempSource(n),o);for(let n=1;n<=8;n++)p(s.probeTemp(n),o);o()}});var wo=`
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
}`;w("diag-i2c",wo);var zo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Sa=h({tag:"diag-i2c",render:zo,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=k("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Ge()}),F("i2cResult",o),o()}});var _o=`
.diag-zone {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: var(--panel-shadow);
}
.diag-zone .card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.card-title-preheat {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 5px;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .4px;
  text-transform: uppercase;
  border: 1.5px solid;
}

.card-title-preheat.on {
  border-color: rgba(100,255,100,.6);
  background: rgba(60,120,60,.4);
  color: #80FF80;
  box-shadow: 0 0 12px rgba(100,255,100,.2);
}

.card-title-preheat.off {
  border-color: rgba(120,120,120,.4);
  background: rgba(40,40,40,.3);
  color: #999999;
}

.card-title-preheat-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  box-shadow: 0 0 5px currentColor;
  flex-shrink: 0;
}

.card-title-preheat-dot.on {
  background: #60FF60;
  box-shadow: 0 0 8px rgba(96,255,96,.8);
}

.card-title-preheat-dot.off {
  background: #666666;
  box-shadow: 0 0 3px rgba(102,102,102,.4);
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
`;w("diag-zone",_o);function So(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function it(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function lt(e){return e!=null?Number(e).toFixed(0):"---"}function ko(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var Eo=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
            <div class="dz-motor-param"><span class="dz-motor-param-name">Preheat advance</span><span class="dz-motor-param-val" data-dz-ph="${t}">---</span></div>
          </div>
          <div class="dz-fault-row" data-dz-faultrow="${t}" style="display:none">
            <span class="dz-fault-label">Last fault</span>
            <span class="dz-fault-val" data-dz-fault="${t}">NONE</span>
          </div>
        </div>
      </div>`;return`
    <div class="diag-zone">
      <div class="card-title">
        <span>Zone Snapshot</span>
        <div class="card-title-preheat off" role="status" aria-live="polite" data-preheat-badge>
          <span class="card-title-preheat-dot off"></span>
          <span>Preheat: Off</span>
        </div>
      </div>
      <div class="dz-grid">${e}</div>
    </div>
  `},Na=h({tag:"diag-zone",render:Eo,onMount(e,t){function r(n){let a=String(_(s.state(n))||"").toUpperCase()||"OFF",l=T(s.enabled(n)),d=t.querySelector('[data-dz-state="'+n+'"]');d.textContent=l?a:"OFF",d.className="dz-state-badge"+(l?" "+So(a):""),t.querySelector('[data-dz-temp="'+n+'"]').textContent=D(b(s.temp(n))),t.querySelector('[data-dz-valve="'+n+'"]').textContent=$(b(s.valve(n))),t.querySelector('[data-dz-ret="'+n+'"]').textContent=D(b(i.ret)),t.querySelector('[data-dz-orip="'+n+'"]').textContent=lt(b(s.motorOpenRipples(n))),t.querySelector('[data-dz-crip="'+n+'"]').textContent=lt(b(s.motorCloseRipples(n))),t.querySelector('[data-dz-ofac="'+n+'"]').textContent=it(b(s.motorOpenFactor(n))),t.querySelector('[data-dz-cfac="'+n+'"]').textContent=it(b(s.motorCloseFactor(n))),t.querySelector('[data-dz-ph="'+n+'"]').textContent=ko(b(s.preheatAdvance(n)));let g=String(_(s.motorLastFault(n))||"").toUpperCase(),m=g&&g!=="NONE"&&g!=="OK",u=t.querySelector('[data-dz-faultrow="'+n+'"]');u.style.display=m?"flex":"none",m&&(t.querySelector('[data-dz-fault="'+n+'"]').textContent=g)}for(let n=1;n<=6;n++){let a=n,l=()=>r(a);p(s.state(a),l),p(s.enabled(a),l),p(s.temp(a),l),p(s.valve(a),l),p(i.ret,l),p(s.motorOpenRipples(a),l),p(s.motorCloseRipples(a),l),p(s.motorOpenFactor(a),l),p(s.motorCloseFactor(a),l),p(s.preheatAdvance(a),l),p(s.motorLastFault(a),l),r(a)}function o(){let n=t.querySelector("[data-preheat-badge]"),a=n.querySelector(".card-title-preheat-dot"),l=n.querySelector("span:last-child"),g=(_(i.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";n.classList.toggle("on",g),n.classList.toggle("off",!g),a.classList.toggle("on",g),a.classList.toggle("off",!g),l.textContent=g?"Preheat: On":"Preheat: Off"}p(i.simplePreheatEnabled,o),o()}});var Fo=`
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
`;w("diag-activity",Fo);var Co=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function Mo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Ra=h({tag:"diag-activity",render:Co,onMount(e,t){let r=t.querySelector(".diag-log");function o(){Mo(r,qe())}F("activityLog",o),o()}});var Lo=`
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
`;w("diag-manual-badge",Lo);var No=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Ha=h({tag:"diag-manual-badge",render:No,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let n=!!k("manualMode");r&&r.classList.toggle("on",n)}F("manualMode",o),o()}});var Do=`
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
`;w("diag-zone-motor",Do);var Ao=e=>{let t=e.zone||k("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Ua=h({tag:"diag-zone-motor-card",render:Ao,onMount(e,t){let r=Number(e.zone||k("selectedZone")||1),o=!!k("manualMode"),n=t.querySelector(".manual-mode-toggle"),a=t.querySelector(".motor-gated"),l=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),g=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),u=t.querySelector(".motor-stop-btn");function f(z){o=!!z,n&&(n.classList.toggle("on",o),n.setAttribute("aria-checked",o?"true":"false")),a&&a.classList.toggle("locked",!o),[l,d,g,m,u].forEach(E=>{E&&(E.disabled=!o)})}function S(){let z=!o;if(f(z),z){ke(!0);for(let E=1;E<=6;E++)Se(E)}else ke(!1)}function x(){let z=b(s.motorTarget(r));d&&z!=null?d.value=Number(z).toFixed(0):d&&(d.value="0")}l==null||l.addEventListener("change",()=>{r=Number(l.value||1),x()}),n==null||n.addEventListener("click",S),n==null||n.addEventListener("keydown",z=>{z.key!==" "&&z.key!=="Enter"||(z.preventDefault(),S())});for(let z=1;z<=6;z++)p(s.motorTarget(z),x);x(),f(o),F("manualMode",()=>{f(!!k("manualMode"))}),d==null||d.addEventListener("change",z=>{if(!o)return;let E=z.target.value;$e(r,E)}),g==null||g.addEventListener("click",()=>{o&&Ue(r,1e4)}),m==null||m.addEventListener("click",()=>{o&&Xe(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Se(r)})}});var Oo=`
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
`;w("diag-zone-recovery",Oo);var To=e=>{let t=e.zone||k("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},en=h({tag:"diag-zone-recovery-card",render:To,onMount(e,t){let r=Number(e.zone||k("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),n=t.querySelector(".recovery-fault-btn"),a=t.querySelector(".recovery-factors-btn"),l=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),n==null||n.addEventListener("click",()=>{Ye(r)}),a==null||a.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&Je(r)}),l==null||l.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&Ke(r)})}});var Ro=`
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
`;w("settings-manifold-card",Ro);var qo=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},dn=h({tag:"settings-manifold-card",render:qo,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),n=t.querySelector(".sm-ret");function a(){r.value=_(i.manifoldType)||"NC (Normally Closed)",o.value=_(i.manifoldFlowProbe)||"Probe 7",n.value=_(i.manifoldReturnProbe)||"Probe 8";for(let l=1;l<=8;l++){let d=t.querySelector('[data-probe="'+l+'"]'),g=b(s.probeTemp(l));d&&(d.textContent=D(g))}}r.addEventListener("change",()=>I("manifold_type",r.value)),o.addEventListener("change",()=>I("manifold_flow_probe",o.value)),n.addEventListener("change",()=>I("manifold_return_probe",n.value)),p(i.manifoldType,a),p(i.manifoldFlowProbe,a),p(i.manifoldReturnProbe,a);for(let l=1;l<=8;l++)p(s.probeTemp(l),a);a()}});var Po=`
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

.settings-control-card .btn.sc-simple-preheat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.settings-control-card .btn.sc-simple-preheat.is-on {
  border-color: rgba(100,255,100,.65);
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  box-shadow: inset 0 0 0 1px rgba(100,255,100,.2);
}

.settings-control-card .btn.sc-simple-preheat.is-off {
  border-color: rgba(170,170,170,.45);
  background: rgba(70,70,70,.22);
  color: #DEDEDE;
}

.settings-control-card .btn.sc-simple-preheat .preheat-state {
  font-weight: 800;
  letter-spacing: .45px;
}

.settings-control-card .btn.sc-simple-preheat .preheat-action {
  font-size: .66rem;
  text-transform: uppercase;
  opacity: .95;
}
`;w("settings-control-card",Po);var Zo=()=>`
  <div class="settings-control-card">
    <div class="card-title">Control</div>
    <div class="btn-row">
      <button class="btn sc-simple-preheat">
        <span class="preheat-state">Simple Preheat: ---</span>
        <span class="preheat-action">Toggle</span>
      </button>
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,xn=h({tag:"settings-control-card",render:Zo,onMount(e,t){let r=t.querySelector(".sc-simple-preheat"),o=r.querySelector(".preheat-state"),n=r.querySelector(".preheat-action");function a(){let d=String(_(i.simplePreheatEnabled)||"").toLowerCase();return d==="on"||d==="true"||d==="1"||d==="enabled"}function l(){let d=a();r.classList.toggle("is-on",d),r.classList.toggle("is-off",!d),o.textContent="Simple Preheat: "+(d?"ENABLED":"DISABLED"),n.textContent=d?"Tap to disable":"Tap to enable"}r.addEventListener("click",()=>{let d=!a();I("simple_preheat_enabled",d?"on":"off")}),p(i.simplePreheatEnabled,l),l(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ee("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ee("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ee("restart")})}});var Io=`
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
`;w("settings-motor-calibration-card",Io);var Y=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Ho=()=>{let e=`
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
  `};function Bo(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function dt(e,t){let r=Number(t);return Number.isFinite(r)?Bo(e)?String(Math.round(r)):r.toFixed(2):"0"}var kn=h({tag:"settings-motor-calibration-card",render:Ho,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function n(l){if(l==="HmIP VdMot"&&oe("hmip_runtime_limit_seconds",40),l==="Generic"){let d=Number(b(i.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&oe("generic_runtime_limit_seconds",45)}}function a(){let l=_(i.motorProfileDefault)||"HmIP VdMot";r&&(r.value=l),o&&(l==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=dt("generic_runtime_limit_seconds",b(i.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<Y.length;d++){let g=Y[d],m=t.querySelector(".smc-"+g.cls);m&&g.key!=="generic_runtime_limit_seconds"&&(m.value=dt(g.key,b(g.id)))}}r&&(r.addEventListener("change",()=>{I("motor_profile_default",r.value),n(r.value)}),p(i.motorProfileDefault,a));for(let l=0;l<Y.length;l++){let d=Y[l],g=t.querySelector(".smc-"+d.cls);g&&(g.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((_(i.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;oe("generic_runtime_limit_seconds",g.value);return}oe(d.key,g.value)}),p(d.id,a))}p(i.genericRuntimeLimitSeconds,a),p(i.hmipRuntimeLimitSeconds,a),n(_(i.motorProfileDefault)||"HmIP VdMot"),a()}});var Wo=`
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
`;w("app-root",Wo);var jo=e=>`
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
`;h({tag:"app-root",render:jo,onMount(e,t){t.querySelector(".hdr").appendChild(M("hv6-header")),t.querySelector(".overview-flow").appendChild(M("flow-diagram")),t.querySelector(".overview-status").appendChild(M("status-card")),t.querySelector(".overview-connectivity").appendChild(M("connectivity-card")),t.querySelector(".overview-graphs").appendChild(M("graph-widgets")),t.querySelector(".zone-selector").appendChild(M("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(M("zone-detail",{zone:k("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(M("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(M("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(M("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(M("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(M("settings-motor-calibration-card")),t.querySelector(".diag-manual-badge-slot").appendChild(M("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(M("diag-i2c")),r.appendChild(M("diag-activity")),r.appendChild(M("diag-zone"));let o=k("selectedZone")||1;r.appendChild(M("diag-zone-motor-card",{zone:o})),r.appendChild(M("diag-zone-recovery-card",{zone:o}));let n=t.querySelectorAll(".sec");function a(){let l=k("section");n.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===l)})}F("section",a),a()}});function Vo(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(M("app-root")),we()}Vo();})();

(()=>{var Ve={},xe={};function w(e){return Ve[e.tag]=e,e}function M(e,t){let r=Ve[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let s=r.state(t||{});for(let d in s)o[d]=s[d]}if(r.methods)for(let s in r.methods)o[s]=r.methods[s];let a=document.createElement("div");a.innerHTML=r.render(o);let n=a.firstElementChild;return r.onMount&&r.onMount(o,n),n}function m(e,t){(xe[e]||(xe[e]=[])).push(t)}function R(e){let t=xe[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var I=6,Mt=28,he=Object.create(null),Nt=Dt(),A={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Lt(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Nt,manualMode:!1,zoneStateHistory:null};function Lt(){let e=Object.create(null);for(let t=1;t<=I;t++)e[t]=[];return e}function Dt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<I;)e.push("");return e.slice(0,I)}function Tt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(A.zoneNames))}catch(e){}}function q(e){return"$dashboard:"+e}function ye(e){return Math.max(1,Math.min(I,Number(e)||1))}function je(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function x(e){let t=he[e];return t?t.v!=null?t.v:t.value!=null?t.value:je(t.s!=null?t.s:t.state):null}function E(e){let t=he[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Ot(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function P(e){return Ot(E(e))}function c(e,t){let r=he[e];r||(r=he[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);R(e),e==="text_sensor-firmware_version"&&Y("firmwareVersion",E(e)||"")}function F(e,t){m(q(e),t)}function z(e){return A[e]}function Y(e,t){A[e]=t,R(q(e))}function Ge(e){A.section!==e&&(A.section=e,R(q("section")))}function $e(e){let t=ye(e);A.selectedZone!==t&&(A.selectedZone=t,R(q("selectedZone")))}function K(e){let t=!!e;A.live!==t&&(A.live=t,R(q("live")))}function Ue(){A.pendingWrites+=1,R(q("pendingWrites"))}function Le(){A.pendingWrites=Math.max(0,A.pendingWrites-1),A.lastWriteAt=Date.now(),R(q("pendingWrites"))}function Xe(){return A.pendingWrites>0?!0:Date.now()-A.lastWriteAt<2e3}function Ye(e,t){let r=ye(e)-1;A.zoneNames[r]=String(t||"").trim(),Tt(),R(q("zoneNames"))}function G(e){return A.zoneNames[ye(e)-1]||""}function J(e){let t=ye(e),r=G(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function Q(e){A.i2cResult=e||"No scan has been run yet.",R(q("i2cResult"))}function k(e,t){let r={time:Rt(),msg:String(e||"")};for(A.activityLog.push(r);A.activityLog.length>60;)A.activityLog.shift();if(t>=1&&t<=I){let o=A.zoneLog[t];for(o.push(r);o.length>8;)o.shift();R(q("zoneLog:"+t))}R(q("activityLog"))}function Ke(e){return e>=1&&e<=I?A.zoneLog[e]:A.activityLog}function Ne(e,t){let r=A[e];if(!Array.isArray(r))return;let o=je(t);if(o!=null){for(r.push(o);r.length>Mt;)r.shift();R(q(e))}}function ae(e){let t=Date.now();if(!e&&t-A.lastHistoryAt<3200)return;A.lastHistoryAt=t;let r=0,o=0;for(let a=1;a<=I;a++){let n=x("sensor-zone_"+a+"_valve_pct");n!=null&&(r+=n,o+=1)}Ne("historyFlow",x("sensor-manifold_flow_temperature")),Ne("historyReturn",x("sensor-manifold_return_temperature")),Ne("historyDemand",o?r/o:0)}function Rt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function we(e){A.zoneStateHistory=e||null,R(q("zoneStateHistory"))}var i={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},l={flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled"};var L=6,qt=8,Je=null,se=0,y={temp:new Float32Array(L),setpoint:new Float32Array(L),valve:new Float32Array(L),enabled:new Uint8Array(L),driversEnabled:1,fault:0,manualMode:0};function Pt(){y.manualMode=0,Y("manualMode",!1);for(let n=0;n<L;n++){y.temp[n]=20.5+n*.4,y.setpoint[n]=21+n%3*.5,y.valve[n]=12+n*8,y.enabled[n]=n===4?0:1;let s=n+1;c(i.temp(s),{value:y.temp[n]}),c(i.setpoint(s),{value:y.setpoint[n]}),c(i.valve(s),{value:y.valve[n]}),c(i.state(s),{state:y.valve[n]>5?"heating":"idle"}),c(i.enabled(s),{value:!!y.enabled[n],state:y.enabled[n]?"on":"off"}),c(i.probe(s),{state:"Probe "+s}),c(i.tempSource(s),{state:s%2?"Local Probe":"BLE Sensor"}),c(i.syncTo(s),{state:"None"}),c(i.pipeType(s),{state:"PEX 16mm"}),c(i.area(s),{value:8+s*3.5}),c(i.spacing(s),{value:[150,200,150,100,200,150][n]}),c(i.zigbee(s),{state:"zone_"+s+"_mock_sensor"}),c(i.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),c(i.exteriorWalls(s),{state:["N","E","S","W","N,E","S,W"][n]}),c(i.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=qt;n++){let s=n<=L?n:L,d=y.temp[s-1]+(n>L?1:.1*n);c(i.probeTemp(n),{value:d})}c(l.flow,{value:34.1}),c(l.ret,{value:30.4}),c(l.uptime,{value:18*3600+720}),c(l.wifi,{value:-57}),c(l.drivers,{value:!0,state:"on"}),c(l.fault,{value:!1,state:"off"}),c(l.ip,{state:"192.168.1.86"}),c(l.ssid,{state:"MockLab"}),c(l.mac,{state:"D8:3B:DA:12:34:56"}),c(l.firmware,{state:"0.5.x-mock"}),c(l.manifoldFlowProbe,{state:"Probe 7"}),c(l.manifoldReturnProbe,{state:"Probe 8"}),c(l.manifoldType,{state:"NC (Normally Closed)"}),c(l.motorProfileDefault,{state:"HmIP VdMot"}),c(l.closeThresholdMultiplier,{value:1.7}),c(l.closeSlopeThreshold,{value:1}),c(l.closeSlopeCurrentFactor,{value:1.4}),c(l.openThresholdMultiplier,{value:1.7}),c(l.openSlopeThreshold,{value:.8}),c(l.openSlopeCurrentFactor,{value:1.3}),c(l.openRippleLimitFactor,{value:1}),c(l.genericRuntimeLimitSeconds,{value:45}),c(l.hmipRuntimeLimitSeconds,{value:40}),c(l.relearnAfterMovements,{value:2e3}),c(l.relearnAfterHours,{value:168}),c(l.learnedFactorMinSamples,{value:3}),c(l.learnedFactorMaxDeviationPct,{value:12}),c(l.simplePreheatEnabled,{state:"on"}),ae(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<r;n++){let s=(r-1-n)*e,d=t-s,u=Math.floor(n/12)%24,g=o.map(p=>p[u%p.length]);a.push([d,...g])}we({interval_s:e,uptime_s:t,count:r,entries:a})}function Ht(){se+=1,c(l.uptime,{value:Number(Date.now()/1e3)|0}),c(l.wifi,{value:-55-Math.round((1+Math.sin(se/4))*6)});let e=0,t=0,r=0;for(let s=0;s<L;s++){let d=s+1,u=!!y.enabled[s],g=y.temp[s],p=y.setpoint[s],f=u&&y.driversEnabled&&!y.manualMode&&g<p-.25;y.manualMode?y.valve[s]=Math.max(0,y.valve[s]):!u||!y.driversEnabled?y.valve[s]=Math.max(0,y.valve[s]-6):f?y.valve[s]=Math.min(100,y.valve[s]+7+d%3):y.valve[s]=Math.max(0,y.valve[s]-5);let S=f?.05+y.valve[s]/2200:-.03+y.valve[s]/3200;y.temp[s]=g+S+Math.sin((se+d)/5)*.04,u&&y.valve[s]>0&&(e+=y.valve[s],t+=1,r=Math.max(r,y.valve[s])),c(i.temp(d),{value:y.temp[s]}),c(i.valve(d),{value:Math.round(y.valve[s])});let v=Math.max(0,(y.setpoint[s]-y.temp[s]-.15)*.22);c(i.preheatAdvance(d),{value:Number(v.toFixed(2))}),c(i.state(d),{state:u?f?"heating":"idle":"off"}),c(i.enabled(d),{value:u,state:u?"on":"off"}),c(i.probeTemp(d),{value:y.temp[s]+Math.sin((se+d)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(se/6)*.25,a=o-(t?2.1+e/Math.max(1,t*50):1.1);c(l.flow,{value:Number(o.toFixed(1))}),c(l.ret,{value:Number(a.toFixed(1))}),c(i.probeTemp(7),{value:Number((a-.4).toFixed(1))}),c(i.probeTemp(8),{value:Number((o+.2).toFixed(1))}),ae(!0);let n=z("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0)}function Qe(){Je||(Pt(),K(!0),Je=setInterval(Ht,1200))}function ze(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=L){let n=Number(r);Number.isNaN(n)||(y.setpoint[o-1]=n,c(i.setpoint(o),{value:n}),k("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=L){let n=r>.5;y.enabled[o-1]=n?1:0,c(i.enabled(o),{value:n,state:n?"on":"off"}),k("Zone "+o+(n?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let n=r>.5;y.driversEnabled=n?1:0,c(l.drivers,{value:n,state:n?"on":"off"}),k(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=r>.5;y.manualMode=n?1:0,Y("manualMode",n);return}if(t==="motor_target"&&o>=1&&o<=L){let n=Number(r||0);c(i.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),k("Motor "+o+" target set to "+n+"%",o);return}if(t==="command"){let n=String(r);if(n==="i2c_scan"){Q(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),k("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){k("Command executed: "+n);return}if(n==="open_motor_timed"&&o>=1&&o<=L){k("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=L){k("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=L){k("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=L){k("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=L){k("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=L){k("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){c(i.probe(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){c(i.tempSource(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){c(i.syncTo(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){c(i.pipeType(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){c(l.manifoldType,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){c(l.manifoldFlowProbe,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){c(l.manifoldReturnProbe,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){c(l.motorProfileDefault,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){c(l.simplePreheatEnabled,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="zone_zigbee_device"&&o>=1){c(i.zigbee(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_ble_mac"&&o>=1){c(i.ble(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){c(i.exteriorWalls(o),{state:String(r)||"None"}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){c(i.area(o),{value:Number(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){c(i.spacing(o),{value:Number(r)}),k("Setting updated: "+t+" = "+r,o);return}let a={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct};if(a[t]){let n=Number(r);Number.isNaN(n)||(c(a[t],{value:n}),k("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){ze({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!y.enabled[e-1];ze({key:"zone_enabled",value:t?1:0,zone:e})}};var et="/dashboard";function tt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function T(e){if(Ue(),tt())try{return ze(e),Promise.resolve({ok:!0})}finally{Le()}return fetch(et+"/set",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:(()=>{let t=new URLSearchParams;for(let[r,o]of Object.entries(e))o!=null&&t.append(r,o);return t.toString()})()}).finally(()=>{Le()})}function De(e,t){return c(i.setpoint(e),{value:t}),T({key:"zone_setpoint",value:t,zone:e})}function ot(e,t){return c(i.enabled(e),{state:t?"on":"off",value:t}),T({key:"zone_enabled",value:t?1:0,zone:e})}function rt(e){return c(l.drivers,{state:e?"on":"off",value:e}),T({key:"drivers_enabled",value:e?1:0})}function ie(e,t){return T({key:"command",value:e,zone:t||void 0})}function nt(){return Q("Scanning I2C bus..."),k("I2C scan started"),ie("i2c_scan")}var Zt={zone_probe:e=>i.probe(e),zone_temp_source:e=>i.tempSource(e),zone_sync_to:e=>i.syncTo(e),zone_pipe_type:e=>i.pipeType(e)},It={zone_zigbee_device:e=>i.zigbee(e),zone_ble_mac:e=>i.ble(e),zone_exterior_walls:e=>i.exteriorWalls(e)},Wt={zone_area_m2:e=>i.area(e),zone_pipe_spacing_mm:e=>i.spacing(e)},Bt={manifold_type:l.manifoldType,manifold_flow_probe:l.manifoldFlowProbe,manifold_return_probe:l.manifoldReturnProbe,motor_profile_default:l.motorProfileDefault,simple_preheat_enabled:l.simplePreheatEnabled},Vt={close_threshold_multiplier:l.closeThresholdMultiplier,close_slope_threshold:l.closeSlopeThreshold,close_slope_current_factor:l.closeSlopeCurrentFactor,open_threshold_multiplier:l.openThresholdMultiplier,open_slope_threshold:l.openSlopeThreshold,open_slope_current_factor:l.openSlopeCurrentFactor,open_ripple_limit_factor:l.openRippleLimitFactor,generic_runtime_limit_seconds:l.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:l.hmipRuntimeLimitSeconds,relearn_after_movements:l.relearnAfterMovements,relearn_after_hours:l.relearnAfterHours,learned_factor_min_samples:l.learnedFactorMinSamples,learned_factor_max_deviation_pct:l.learnedFactorMaxDeviationPct};function ee(e,t,r){let o=Zt[t];return o&&c(o(e),{state:r}),T({key:t,value:r,zone:e})}function le(e,t,r){let o=It[t];return o&&c(o(e),{state:r}),T({key:t,value:r,zone:e})}function Te(e,t,r){let o=Number(r),a=Wt[t];return a&&!Number.isNaN(o)&&c(a(e),{value:o}),T({key:t,value:o,zone:e})}function $(e,t){let r=Bt[e];return r&&c(r,{state:t}),T({key:e,value:t})}function de(e,t){let r=Number(t),o=Vt[e];return o&&!Number.isNaN(r)&&c(o,{value:r}),T({key:e,value:r})}function at(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return c(i.motorTarget(e),{value:o}),k("Motor "+e+" target set to "+o+"%",e),T({key:"motor_target",value:o,zone:e})}function st(e,t=1e4){return k("Motor "+e+" open for "+t+"ms",e),T({key:"command",value:"open_motor_timed",zone:e})}function it(e,t=1e4){return k("Motor "+e+" close for "+t+"ms",e),T({key:"command",value:"close_motor_timed",zone:e})}function Oe(e){return k("Motor "+e+" stopped",e),T({key:"command",value:"stop_motor",zone:e})}function Re(e){return Y("manualMode",!!e),k(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),T({key:"manual_mode",value:e?1:0})}function lt(e){return k("Motor "+e+" fault reset",e),T({key:"command",value:"motor_reset_fault",zone:e})}function dt(e){return k("Motor "+e+" learned factors reset",e),T({key:"command",value:"motor_reset_learned_factors",zone:e})}function ct(e){return k("Motor "+e+" reset and relearn started",e),T({key:"command",value:"motor_reset_and_relearn",zone:e})}function qe(){tt()||fetch(et+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&we(e)}).catch(()=>{})}var Pe=null,_e=null,pt=null;async function jt(){_e&&_e.abort(),_e=new AbortController;let e=await fetch("/dashboard/state",{cache:"no-store",signal:_e.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function ut(e){if(!(!e||typeof e!="object")&&!Xe()){for(let t in e)c(t,e[t]);ae(!1)}}function Gt(e){if(e){if(!e.type){ut(e);return}if(e.type==="state"){ut(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;k(t),String(t).indexOf("I2C_SCAN:")!==-1&&Q(String(t))}}}function mt(){Pe||(Pe=setTimeout(()=>{Pe=null,He()},1e3))}function He(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Qe();return}jt().then(t=>{K(!0),Gt(t),qe(),pt||(pt=setInterval(qe,300*1e3)),mt()}).catch(()=>{K(!1),mt()})}var gt=Object.create(null);function _(e,t){if(gt[e])return;gt[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function O(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function te(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Se(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function bt(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var $t=`
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
`;_("hv6-header",$t);var Ut=()=>`
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
`,Or=w({tag:"hv6-header",render:Ut,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),a=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),s=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),u=t.querySelectorAll(".menu-link");function g(){let f=z("section");u.forEach(S=>{S.classList.toggle("active",S.getAttribute("data-section")===f)})}function p(){let f=z("live"),S=z("pendingWrites"),v=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":f?"Live":"Offline";r.textContent=v,o.classList.toggle("on",!!f),a.textContent=S>0?"Saving...":f?"Synced":"Offline";let b=S>0?"saving":f?"synced":"offline";a.className="meta-chip meta-chip-state "+b,n.textContent=Se(x(l.uptime)),s.textContent=bt(x(l.wifi));let h=z("firmwareVersion")||E(l.firmware);d.textContent=h?"FW "+h:""}u.forEach(f=>{f.addEventListener("click",S=>{S.preventDefault(),Ge(f.getAttribute("data-section"))})}),F("section",g),F("live",p),F("pendingWrites",p),F("firmwareVersion",p),m(l.uptime,p),m(l.wifi,p),m(l.firmware,p),g(),p()}});var Xt=`
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
`;_("status-card",Xt);var Yt=e=>`
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
`,Wr=w({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Yt,methods:{update(e){this.motorDriversOn=P(l.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=P(l.fault)?"FAULT":"OK",this.connOn=z("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);m(l.drivers,o),m(l.fault,o),F("live",o),r.sw.onclick=()=>{rt(!e.motorDriversOn)},o()}});var Kt=`
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
`;_("connectivity-card",Kt);var Jt=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Xr=w({tag:"connectivity-card",render:Jt,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function s(){r.textContent=E(l.ip)||"---",o.textContent=E(l.ssid)||"---",a.textContent=E(l.mac)||"---",n.textContent=Se(x(l.uptime))}m(l.ip,s),m(l.ssid,s),m(l.mac,s),m(l.uptime,s),s()}});var Qt=`
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
`;_("graph-widgets",Qt);var eo=()=>`
  <div class="graph-widgets">
    <div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div>
    <div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div>
  </div>
`;function ft(e,t,r,o){if(!e.length)return"";let a=Math.min.apply(null,e),n=Math.max.apply(null,e),s=Math.max(.001,n-a),d=e.length>1?(t-o*2)/(e.length-1):0,u="";for(let g=0;g<e.length;g++){let p=o+d*g,f=r-o-(e[g]-a)/s*(r-o*2);u+=(g?" L ":"M ")+p.toFixed(2)+" "+f.toFixed(2)}return u}function vt(e,t,r,o,a){e.innerHTML="";let n=ft(t,220,56,5);if(n){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",n),d.setAttribute("fill","none"),d.setAttribute("stroke",r),d.setAttribute("stroke-width","2.2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}let s=o&&o.length?ft(o,220,56,5):"";if(s){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",s),d.setAttribute("fill","none"),d.setAttribute("stroke",a),d.setAttribute("stroke-width","2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}}var to="var(--accent)",oo="var(--blue)",ro="var(--blue)",en=w({tag:"graph-widgets",render:eo,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand");function s(){let d=z("historyFlow"),u=z("historyReturn"),g=z("historyDemand"),p=d.length?d[d.length-1]:null,f=u.length?u[u.length-1]:null,S=g.length?g[g.length-1]:null;r.textContent=p!=null&&f!=null?(p-f).toFixed(1)+" C":"---",o.textContent=S!=null?Math.round(S)+"%":"---",vt(a,d,to,u,oo),vt(n,g,ro)}F("historyFlow",s),F("historyReturn",s),F("historyDemand",s),s()}});var U={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},xt=24*3600,pe=18,Ze=4,ce=54,Ee=20,ue=4,ke=I*(pe+Ze)-Ze+ue+Ee,no=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg);
  padding: 10px 12px;
  box-shadow: var(--panel-shadow);
}

.timeline-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 10px;
  color: var(--accent);
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .75px;
  font-weight: 700;
}

.timeline-head strong {
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 500;
  letter-spacing: .4px;
  text-transform: none;
}

.timeline-svg {
  width: 100%;
  display: block;
  border-radius: 10px;
  overflow: visible;
}

.timeline-empty {
  color: var(--text-faint);
  font-size: .78rem;
  padding: 12px 0;
  text-align: center;
  letter-spacing: .3px;
}

.timeline-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin-top: 10px;
}

.tl-legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: .67rem;
  color: var(--text-secondary);
  letter-spacing: .3px;
}

.tl-legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}
`;_("zone-state-timeline",no);var ao=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function so(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,a=o-xt,n=1e3,s=n-ce;function d(b){let h=(b-a)/xt;return ce+Math.max(0,Math.min(1,h))*s}let u="http://www.w3.org/2000/svg",g=document.createElementNS(u,"svg");g.setAttribute("viewBox","0 0 "+n+" "+ke),g.classList.add("timeline-svg");let p=document.createElementNS(u,"rect");p.setAttribute("x",ce),p.setAttribute("y",ue),p.setAttribute("width",s),p.setAttribute("height",ke-ue-Ee),p.setAttribute("fill","rgba(10,24,46,0.55)"),p.setAttribute("rx","4"),g.appendChild(p);let f=[6,12,18,24];for(let b of f){let h=o-b*3600,N=d(h),C=document.createElementNS(u,"line");C.setAttribute("x1",N),C.setAttribute("y1",ue),C.setAttribute("x2",N),C.setAttribute("y2",ke-Ee),C.setAttribute("stroke","rgba(120,168,255,.12)"),C.setAttribute("stroke-width","1"),g.appendChild(C)}for(let b=0;b<I;b++){let h=ue+b*(pe+Ze),N=document.createElementNS(u,"rect");N.setAttribute("x",ce),N.setAttribute("y",h),N.setAttribute("width",s),N.setAttribute("height",pe),N.setAttribute("fill",b%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),g.appendChild(N);let C=document.createElementNS(u,"text");C.setAttribute("x",ce-4),C.setAttribute("y",h+pe/2+1),C.setAttribute("text-anchor","end"),C.setAttribute("dominant-baseline","middle"),C.setAttribute("fill","rgba(191,211,245,.65)"),C.setAttribute("font-size","9.5"),C.setAttribute("font-family","Montserrat, sans-serif"),C.setAttribute("font-weight","600"),C.textContent="Z"+(b+1),g.appendChild(C);let H=r.filter(D=>D[0]>=a).map(D=>({t:D[0],state:D[b+1]}));if(H.length===0)continue;let V=H[0].t,X=H[0].state,ne=(D,Z,be)=>{if(be===255)return;let fe=U[be]||U[255];if(fe.color==="transparent")return;let ve=d(D),Ct=d(Z),At=Math.max(1,Ct-ve),j=document.createElementNS(u,"rect");j.setAttribute("x",ve),j.setAttribute("y",h+1),j.setAttribute("width",At),j.setAttribute("height",pe-2),j.setAttribute("fill",fe.color),j.setAttribute("rx","2"),j.setAttribute("opacity","0.88"),g.appendChild(j)};for(let D=1;D<H.length;D++){let Z=H[D];Z.state!==X&&(ne(V,Z.t,X),V=Z.t,X=Z.state)}ne(V,o,X)}let S=ke-Ee+14,v=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let b of v){let h=o-b.hoursAgo*3600,N=d(h),C=document.createElementNS(u,"text");C.setAttribute("x",N),C.setAttribute("y",S),C.setAttribute("text-anchor",b.hoursAgo===0?"end":"middle"),C.setAttribute("fill","rgba(191,211,245,.45)"),C.setAttribute("font-size","9"),C.setAttribute("font-family","Montserrat, sans-serif"),C.textContent=b.label,g.appendChild(C)}return g}function io(e){e.innerHTML="";let t=[{code:5,...U[5]},{code:6,...U[6]},{code:0,...U[0]},{code:1,...U[1]},{code:7,...U[7]},{code:2,...U[2]}];for(let r of t){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(o)}}var sn=w({tag:"zone-state-timeline",render:ao,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");io(o);function a(){let n=z("zoneStateHistory"),s=(()=>{let u=z&&z("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!n||!n.entries||n.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(u);return}let d=so(n,s);d&&r.appendChild(d)}F("zoneStateHistory",a),F("zoneNames",a),a()}});var lo=`
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
`;_("zone-grid",lo);var co=()=>'<div class="zone-grid"></div>',pn=w({tag:"zone-grid",render:co,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(M("zone-card",{zone:r}))}});var po=`
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
`;_("zone-card",po);var uo=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${J(e.zone)}</div>
		<div class="zc-friendly">${G(e.zone)||"---"}</div>
	</div>
`,xn=w({tag:"zone-card",state:e=>({zone:e.zone}),render:uo,onMount(e,t){let r=e.zone,o=i.temp(r),a=i.state(r),n=i.enabled(r),s=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),u=t.querySelector(".zc-zone-name"),g=t.querySelector(".zc-friendly");function p(){let f=P(n),S=String(E(a)||"").toUpperCase()||"OFF",v=z("selectedZone")===r,b=G(r);u.textContent=J(r),g.textContent=b||O(x(o)),s.textContent=f?S:"OFF";let h=f?S:"OFF",N=h==="HEATING"?"#f2c77b":h==="IDLE"?"#79d17e":h==="FAULT"?"#ff7676":"#7D8BA7",C=h==="HEATING"?"#EEA111":h==="IDLE"?"#79d17e":h==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";s.style.color=N,d.style.background=C,d.style.boxShadow=h==="HEATING"?"0 0 5px rgba(238,161,17,.6)":h==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",v),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&S==="HEATING"),t.classList.toggle("zs-idle",f&&S!=="HEATING"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{$e(r)}),m(o,p),m(a,p),m(n,p),F("selectedZone",p),F("zoneNames",p),p()}});var mo=`
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
`;_("zone-detail",mo);var go=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${J(e.zone)}</div>
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
`,En=w({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:go,methods:{update(e,t){let r=z("selectedZone"),o=String(E(i.state(r))||"").toUpperCase(),a=P(i.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=J(r),t.setpoint.textContent=O(x(i.setpoint(r))),t.temp.textContent=O(x(i.temp(r))),t.ret.textContent=O(x("sensor-manifold_return_temperature")),t.valve.textContent=te(x(i.valve(r)));let n=t.badge;n.textContent=a?o||"IDLE":"DISABLED";let s=a?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(s?" "+s:""),t.toggle.classList.toggle("on",a)},incSetpoint(){let e=this.zone,t=x(i.setpoint(e))||20;De(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=x(i.setpoint(e))||20;De(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=P(i.enabled(e));ot(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),a=n=>{let s=z("selectedZone");(n===i.temp(s)||n===i.setpoint(s)||n===i.valve(s)||n===i.state(s)||n===i.enabled(s))&&o()};for(let n=1;n<=6;n++)m(i.temp(n),a),m(i.setpoint(n),a),m(i.valve(n),a),m(i.state(n),a),m(i.enabled(n),a);m("sensor-manifold_return_temperature",o),F("selectedZone",o),o()}});var bo=`
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
`;_("zone-sensor-card",bo);var fo=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
  `};function vo(e,t){let r=e.value,o="<option>None</option>";for(let a=1;a<=6;a++)a!==t&&(o+="<option>Zone "+a+"</option>");e.innerHTML=o,e.value=r||"None"}var Dn=w({tag:"zone-sensor-card",render:fo,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),a=t.querySelector(".zs-zigbee"),n=t.querySelector(".zs-ble"),s=t.querySelector(".zs-sync"),d=t.querySelector(".zs-row-zigbee"),u=t.querySelector(".zs-row-ble"),g=0;function p(){return z("selectedZone")}function f(){let v=p();g!==v&&(vo(s,v),g=v);let b=E(i.probe(v)),h=E(i.tempSource(v))||"Local Probe",N=E(i.syncTo(v))||"None",C=E(i.zigbee(v))||"",H=E(i.ble(v))||"";b&&(r.value=b),o.value=h,s.value=N,document.activeElement!==a&&(a.value=C),document.activeElement!==n&&(n.value=H),d.style.display=h==="Zigbee MQTT"?"":"none",u.style.display=h==="BLE Sensor"?"":"none"}function S(v){let b=p();(v===i.probe(b)||v===i.tempSource(b)||v===i.syncTo(b)||v===i.zigbee(b)||v===i.ble(b))&&f()}r.addEventListener("change",()=>{ee(p(),"zone_probe",r.value)}),o.addEventListener("change",()=>{ee(p(),"zone_temp_source",o.value)}),s.addEventListener("change",()=>{ee(p(),"zone_sync_to",s.value)}),a.addEventListener("change",()=>{le(p(),"zone_zigbee_device",a.value)}),n.addEventListener("change",()=>{le(p(),"zone_ble_mac",n.value)}),F("selectedZone",f);for(let v=1;v<=6;v++)m(i.probe(v),S),m(i.tempSource(v),S),m(i.syncTo(v),S),m(i.zigbee(v),S),m(i.ble(v),S);f()}});var xo=`
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
`;_("zone-room-card",xo);var ho=()=>`
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
`,Zn=w({tag:"zone-room-card",render:ho,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),s=t.querySelectorAll(".wall-btn");function d(){return z("selectedZone")}function u(){let p=d();document.activeElement!==r&&(r.value=G(p)||""),document.activeElement!==o&&(o.value=x(i.area(p))!=null?String(x(i.area(p))):""),document.activeElement!==a&&(a.value=x(i.spacing(p))!=null?String(x(i.spacing(p))):""),n.value=E(i.pipeType(p))||"Unknown";let f=E(i.exteriorWalls(p))||"None",S=f==="None"?[]:f.split(",").filter(Boolean);s.forEach(v=>{let b=v.dataset.wall;v.classList.toggle("active",b==="None"?S.length===0:S.includes(b))})}function g(p){let f=d();(p===i.area(f)||p===i.spacing(f)||p===i.pipeType(f)||p===i.exteriorWalls(f))&&u()}r.addEventListener("change",()=>{Ye(d(),r.value)}),o.addEventListener("change",()=>{Te(d(),"zone_area_m2",o.value)}),a.addEventListener("change",()=>{Te(d(),"zone_pipe_spacing_mm",a.value||"200")}),n.addEventListener("change",()=>{ee(d(),"zone_pipe_type",n.value)}),s.forEach(p=>{p.addEventListener("click",()=>{let f=p.dataset.wall,S=E(i.exteriorWalls(d()))||"None",v=S==="None"?[]:S.split(",").filter(Boolean);if(f==="None")v=[];else{let h=v.indexOf(f);h>=0?v.splice(h,1):v.push(f)}let b=["N","S","E","W"].filter(h=>v.includes(h));le(d(),"zone_exterior_walls",b.length?b.join(","):"None")})}),F("selectedZone",u),F("zoneNames",u);for(let p=1;p<=6;p++)m(i.area(p),g),m(i.spacing(p),g),m(i.pipeType(p),g),m(i.exteriorWalls(p),g);u()}});var yo=`
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
`;_("flow-diagram",yo);var W=6,zt=[60,126,192,258,324,390],Ae=225,oe=36,ge=160,Fe=90,me=oe+ge,B=640,wo=11,We=6,Be=24,Ie=B+20,ht=B+210,yt=B+328,wt=B+420,_t="#7D8BA7",St="#6C7892",zo="#8FCBFF",_o="#BCDFFF",So="#E4D092",ko="#F2B74C",Eo="#8FCBFF",Fo="#D8E7FF",Co="#7D8BA7",Ao="#B7CBF0",Mo="#6C7892",Ce="#A3B6D9",No="#8EA4CD",Lo="#42A5F5",Do="#66BB6A",To="#EF5350";function Me(e,t,r){var o=Ae+(e-2.5)*wo,a=zt[e],n=B-me,s=me+n*.33,d=me+n*.67;return"M"+me+" "+(o-t).toFixed(1)+" C"+s+" "+(o-t).toFixed(1)+" "+d+" "+(a-r).toFixed(1)+" "+B+" "+(a-r).toFixed(1)+" L"+B+" "+(a+r).toFixed(1)+" C"+d+" "+(a+r).toFixed(1)+" "+s+" "+(o+t).toFixed(1)+" "+me+" "+(o+t).toFixed(1)+"Z"}function Oo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function Ro(e){let t=String(G(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function qo(e,t){return t?e==null||Number.isNaN(e)?St:e<.15?zo:e<.4?_o:e<.7?So:ko:_t}function Po(){var e=1160,t=460,r=Ae-Fe/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var a=1;a<=W;a++)o.push('<linearGradient id="rg'+a+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+a+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+a+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=W;n++){var s=Me(n-1,We,Be);o.push('<path d="'+s+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=W;n++){var d=Me(n-1,We,Be);o.push('<path id="fd-path-'+n+'" d="'+d+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+B+'" y1="36" x2="'+B+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var u=5,g=oe-u;for(o.push('<rect x="0" y="'+r+'" width="'+g+'" height="'+Fe+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+oe+'" y="'+r+'" width="'+ge+'" height="'+Fe+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(oe+ge/2)+'" y="'+(Ae-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(oe+ge/2)+'" y="'+(Ae+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(oe+ge/2)+'" y="'+(r+Fe+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Ie+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+ht+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+yt+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+wt+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=W;n++){var p=zt[n-1];o.push('<text id="fd-zn'+n+'" x="'+Ie+'" y="'+(p+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),o.push('<text id="fd-zf'+n+'" x="'+Ie+'" y="'+(p+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zt'+n+'" x="'+ht+'" y="'+(p+10)+'" font-size="19" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+n+'" x="'+yt+'" y="'+(p+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+n+'" x="'+wt+'" y="'+(p+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+No+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+W+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var Ho=()=>`<div class="flow-wrap">${Po()}</div>`;w({tag:"flow-diagram",render:Ho,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(W+1)};for(let a=1;a<=W;a++)r.zones[a]={textTemp:t.querySelector("#fd-zt"+a),textFlow:t.querySelector("#fd-zv"+a),textRet:t.querySelector("#fd-zr"+a),label:t.querySelector("#fd-zn"+a),friendly:t.querySelector("#fd-zf"+a),path:t.querySelector("#fd-path-"+a)};function o(){let a=x(l.flow),n=x(l.ret),s=r.flowEl,d=r.retEl,u=r.dtEl;if(s.textContent=O(a),d.textContent="RET "+O(n),a!=null&&n!=null){let g=Number(a)-Number(n);u.textContent=g.toFixed(1)+"\xB0C",u.setAttribute("fill",g<3?Lo:g>8?To:Do)}else u.textContent="---";for(let g=1;g<=W;g++){let p=x(i.temp(g)),f=x(i.valve(g)),S=P(i.enabled(g)),v=String(E(i.tempSource(g))||"Local Probe"),b=Oo(E(i.probe(g))||""),h=b?x(i.probeTemp(b)):null,N=r.zones[g],C=N.textTemp,H=N.textFlow,V=N.textRet,X=N.label,ne=N.friendly,D=N.path,Z=f!=null?Math.max(0,Math.min(100,Number(f)))/100:0;X.textContent="ZONE "+g;let be=Ro(g);if(ne.textContent=be||"---",X.setAttribute("fill",S?Fo:Co),ne.setAttribute("fill",S?Ao:Mo),C.textContent=O(p),H.textContent=te(f),H.setAttribute("fill",qo(Z,S)),v!=="Local Probe"&&h!=null&&!Number.isNaN(Number(h))?(V.textContent=O(h),V.setAttribute("fill",S?Eo:_t)):(V.textContent="---",V.setAttribute("fill",St)),!S)D.setAttribute("d",Me(g-1,1,2)),D.setAttribute("fill","#2A2D38"),D.setAttribute("opacity","0.4");else{let fe=Math.max(3,Z*Be),ve=Math.max(1.5,Z*We);D.setAttribute("d",Me(g-1,ve,fe)),D.setAttribute("fill","url(#rg"+g+")"),D.setAttribute("opacity","1")}}}m(l.flow,o),m(l.ret,o),F("zoneNames",o);for(let a=1;a<=W;a++)m(i.temp(a),o),m(i.valve(a),o),m(i.enabled(a),o),m(i.probe(a),o),m(i.tempSource(a),o);for(let a=1;a<=8;a++)m(i.probeTemp(a),o);o()}});var Zo=`
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
}`;_("diag-i2c",Zo);var Io=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Kn=w({tag:"diag-i2c",render:Io,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=z("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{nt()}),F("i2cResult",o),o()}});var Wo=`
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
`;_("diag-zone",Wo);function Bo(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function kt(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Et(e){return e!=null?Number(e).toFixed(0):"---"}function Vo(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var jo=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
  `},na=w({tag:"diag-zone",render:jo,onMount(e,t){function r(a){let n=String(E(i.state(a))||"").toUpperCase()||"OFF",s=P(i.enabled(a)),d=t.querySelector('[data-dz-state="'+a+'"]');d.textContent=s?n:"OFF",d.className="dz-state-badge"+(s?" "+Bo(n):""),t.querySelector('[data-dz-temp="'+a+'"]').textContent=O(x(i.temp(a))),t.querySelector('[data-dz-valve="'+a+'"]').textContent=te(x(i.valve(a))),t.querySelector('[data-dz-ret="'+a+'"]').textContent=O(x(l.ret)),t.querySelector('[data-dz-orip="'+a+'"]').textContent=Et(x(i.motorOpenRipples(a))),t.querySelector('[data-dz-crip="'+a+'"]').textContent=Et(x(i.motorCloseRipples(a))),t.querySelector('[data-dz-ofac="'+a+'"]').textContent=kt(x(i.motorOpenFactor(a))),t.querySelector('[data-dz-cfac="'+a+'"]').textContent=kt(x(i.motorCloseFactor(a))),t.querySelector('[data-dz-ph="'+a+'"]').textContent=Vo(x(i.preheatAdvance(a)));let u=String(E(i.motorLastFault(a))||"").toUpperCase(),g=u&&u!=="NONE"&&u!=="OK",p=t.querySelector('[data-dz-faultrow="'+a+'"]');p.style.display=g?"flex":"none",g&&(t.querySelector('[data-dz-fault="'+a+'"]').textContent=u)}for(let a=1;a<=6;a++){let n=a,s=()=>r(n);m(i.state(n),s),m(i.enabled(n),s),m(i.temp(n),s),m(i.valve(n),s),m(l.ret,s),m(i.motorOpenRipples(n),s),m(i.motorCloseRipples(n),s),m(i.motorOpenFactor(n),s),m(i.motorCloseFactor(n),s),m(i.preheatAdvance(n),s),m(i.motorLastFault(n),s),r(n)}function o(){let a=t.querySelector("[data-preheat-badge]"),n=a.querySelector(".card-title-preheat-dot"),s=a.querySelector("span:last-child"),u=(E(l.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";a.classList.toggle("on",u),a.classList.toggle("off",!u),n.classList.toggle("on",u),n.classList.toggle("off",!u),s.textContent=u?"Preheat: On":"Preheat: Off"}m(l.simplePreheatEnabled,o),o()}});var Go=`
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
`;_("diag-activity",Go);var $o=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function Uo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var da=w({tag:"diag-activity",render:$o,onMount(e,t){let r=t.querySelector(".diag-log");function o(){Uo(r,Ke())}F("activityLog",o),o()}});var Xo=`
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
`;_("diag-manual-badge",Xo);var Yo=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,ga=w({tag:"diag-manual-badge",render:Yo,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let a=!!z("manualMode");r&&r.classList.toggle("on",a)}F("manualMode",o),o()}});var Ko=`
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
`;_("diag-zone-motor",Ko);var Jo=e=>{let t=e.zone||z("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},wa=w({tag:"diag-zone-motor-card",render:Jo,onMount(e,t){let r=Number(e.zone||z("selectedZone")||1),o=!!z("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),u=t.querySelector(".motor-open-btn"),g=t.querySelector(".motor-close-btn"),p=t.querySelector(".motor-stop-btn");function f(b){o=!!b,a&&(a.classList.toggle("on",o),a.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[s,d,u,g,p].forEach(h=>{h&&(h.disabled=!o)})}function S(){let b=!o;if(f(b),b){Re(!0);for(let h=1;h<=6;h++)Oe(h)}else Re(!1)}function v(){let b=x(i.motorTarget(r));d&&b!=null?d.value=Number(b).toFixed(0):d&&(d.value="0")}s==null||s.addEventListener("change",()=>{r=Number(s.value||1),v()}),a==null||a.addEventListener("click",S),a==null||a.addEventListener("keydown",b=>{b.key!==" "&&b.key!=="Enter"||(b.preventDefault(),S())});for(let b=1;b<=6;b++)m(i.motorTarget(b),v);v(),f(o),F("manualMode",()=>{f(!!z("manualMode"))}),d==null||d.addEventListener("change",b=>{if(!o)return;let h=b.target.value;at(r,h)}),u==null||u.addEventListener("click",()=>{o&&st(r,1e4)}),g==null||g.addEventListener("click",()=>{o&&it(r,1e4)}),p==null||p.addEventListener("click",()=>{o&&Oe(r)})}});var Qo=`
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
`;_("diag-zone-recovery",Qo);var er=e=>{let t=e.zone||z("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Fa=w({tag:"diag-zone-recovery-card",render:er,onMount(e,t){let r=Number(e.zone||z("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),a=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),s=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),a==null||a.addEventListener("click",()=>{lt(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&dt(r)}),s==null||s.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&ct(r)})}});var tr=`
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
`;_("settings-manifold-card",tr);var or=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},Oa=w({tag:"settings-manifold-card",render:or,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret");function n(){r.value=E(l.manifoldType)||"NC (Normally Closed)",o.value=E(l.manifoldFlowProbe)||"Probe 7",a.value=E(l.manifoldReturnProbe)||"Probe 8";for(let s=1;s<=8;s++){let d=t.querySelector('[data-probe="'+s+'"]'),u=x(i.probeTemp(s));d&&(d.textContent=O(u))}}r.addEventListener("change",()=>$("manifold_type",r.value)),o.addEventListener("change",()=>$("manifold_flow_probe",o.value)),a.addEventListener("change",()=>$("manifold_return_probe",a.value)),m(l.manifoldType,n),m(l.manifoldFlowProbe,n),m(l.manifoldReturnProbe,n);for(let s=1;s<=8;s++)m(i.probeTemp(s),n);n()}});var rr=`
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
`;_("settings-control-card",rr);var nr=()=>`
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
`,Va=w({tag:"settings-control-card",render:nr,onMount(e,t){let r=t.querySelector(".sc-simple-preheat"),o=r.querySelector(".preheat-state"),a=r.querySelector(".preheat-action");function n(){let d=String(E(l.simplePreheatEnabled)||"").toLowerCase();return d==="on"||d==="true"||d==="1"||d==="enabled"}function s(){let d=n();r.classList.toggle("is-on",d),r.classList.toggle("is-off",!d),o.textContent="Simple Preheat: "+(d?"ENABLED":"DISABLED"),a.textContent=d?"Tap to disable":"Tap to enable"}r.addEventListener("click",()=>{let d=!n();$("simple_preheat_enabled",d?"on":"off")}),m(l.simplePreheatEnabled,s),s(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ie("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ie("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ie("restart")})}});var ar=`
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
`;_("settings-motor-calibration-card",ar);var re=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:l.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:l.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:l.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:l.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:l.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:l.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:l.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:l.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:l.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:l.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:l.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:l.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],sr=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<re.length;r++){let o=re[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function ir(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function Ft(e,t){let r=Number(t);return Number.isFinite(r)?ir(e)?String(Math.round(r)):r.toFixed(2):"0"}var Ka=w({tag:"settings-motor-calibration-card",render:sr,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function a(s){if(s==="HmIP VdMot"&&de("hmip_runtime_limit_seconds",40),s==="Generic"){let d=Number(x(l.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&de("generic_runtime_limit_seconds",45)}}function n(){let s=E(l.motorProfileDefault)||"HmIP VdMot";r&&(r.value=s),o&&(s==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=Ft("generic_runtime_limit_seconds",x(l.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<re.length;d++){let u=re[d],g=t.querySelector(".smc-"+u.cls);g&&u.key!=="generic_runtime_limit_seconds"&&(g.value=Ft(u.key,x(u.id)))}}r&&(r.addEventListener("change",()=>{$("motor_profile_default",r.value),a(r.value)}),m(l.motorProfileDefault,n));for(let s=0;s<re.length;s++){let d=re[s],u=t.querySelector(".smc-"+d.cls);u&&(u.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((E(l.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;de("generic_runtime_limit_seconds",u.value);return}de(d.key,u.value)}),m(d.id,n))}m(l.genericRuntimeLimitSeconds,n),m(l.hmipRuntimeLimitSeconds,n),a(E(l.motorProfileDefault)||"HmIP VdMot"),n()}});var lr=`
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
`;_("app-root",lr);var dr=e=>`
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
        <div class="overview-timeline" style="margin-top:14px"></div>
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
`;w({tag:"app-root",render:dr,onMount(e,t){t.querySelector(".hdr").appendChild(M("hv6-header")),t.querySelector(".overview-flow").appendChild(M("flow-diagram")),t.querySelector(".overview-status").appendChild(M("status-card")),t.querySelector(".overview-connectivity").appendChild(M("connectivity-card")),t.querySelector(".overview-graphs").appendChild(M("graph-widgets")),t.querySelector(".overview-timeline").appendChild(M("zone-state-timeline")),t.querySelector(".zone-selector").appendChild(M("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(M("zone-detail",{zone:z("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(M("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(M("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(M("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(M("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(M("settings-motor-calibration-card")),t.querySelector(".diag-manual-badge-slot").appendChild(M("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(M("diag-i2c")),r.appendChild(M("diag-activity")),r.appendChild(M("diag-zone"));let o=z("selectedZone")||1;r.appendChild(M("diag-zone-motor-card",{zone:o})),r.appendChild(M("diag-zone-recovery-card",{zone:o}));let a=t.querySelectorAll(".sec");function n(){let s=z("section");a.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===s)})}F("section",n),n()}});function cr(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(M("app-root")),He()}cr();})();

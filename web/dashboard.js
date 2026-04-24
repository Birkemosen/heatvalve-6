(()=>{var je={},xe={};function y(e){return je[e.tag]=e,e}function M(e,t){let r=je[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let s=r.state(t||{});for(let d in s)o[d]=s[d]}if(r.methods)for(let s in r.methods)o[s]=r.methods[s];let a=document.createElement("div");a.innerHTML=r.render(o);let n=a.firstElementChild;return r.onMount&&r.onMount(o,n),n}function m(e,t){(xe[e]||(xe[e]=[])).push(t)}function q(e){let t=xe[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var W=6,Lt=28,he=Object.create(null),Mt=Dt(),A={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Nt(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Mt,manualMode:!1,zoneStateHistory:null};function Nt(){let e=Object.create(null);for(let t=1;t<=W;t++)e[t]=[];return e}function Dt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<W;)e.push("");return e.slice(0,W)}function Tt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(A.zoneNames))}catch(e){}}function I(e){return"$dashboard:"+e}function ye(e){return Math.max(1,Math.min(W,Number(e)||1))}function Ve(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function x(e){let t=he[e];return t?t.v!=null?t.v:t.value!=null?t.value:Ve(t.s!=null?t.s:t.state):null}function w(e){let t=he[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Ot(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function R(e){return Ot(w(e))}function c(e,t){let r=he[e];r||(r=he[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);q(e),e==="text_sensor-firmware_version"&&K("firmwareVersion",w(e)||"")}function C(e,t){m(I(e),t)}function E(e){return A[e]}function K(e,t){A[e]=t,q(I(e))}function Ge(e){A.section!==e&&(A.section=e,q(I("section")))}function $e(e){let t=ye(e);A.selectedZone!==t&&(A.selectedZone=t,q(I("selectedZone")))}function J(e){let t=!!e;A.live!==t&&(A.live=t,q(I("live")))}function Ue(){A.pendingWrites+=1,q(I("pendingWrites"))}function Ne(){A.pendingWrites=Math.max(0,A.pendingWrites-1),A.lastWriteAt=Date.now(),q(I("pendingWrites"))}function Xe(){return A.pendingWrites>0?!0:Date.now()-A.lastWriteAt<2e3}function Ye(e,t){let r=ye(e)-1;A.zoneNames[r]=String(t||"").trim(),Tt(),q(I("zoneNames"))}function U(e){return A.zoneNames[ye(e)-1]||""}function Q(e){let t=ye(e),r=U(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ee(e){A.i2cResult=e||"No scan has been run yet.",q(I("i2cResult"))}function k(e,t){let r={time:Rt(),msg:String(e||"")};for(A.activityLog.push(r);A.activityLog.length>60;)A.activityLog.shift();if(t>=1&&t<=W){let o=A.zoneLog[t];for(o.push(r);o.length>8;)o.shift();q(I("zoneLog:"+t))}q(I("activityLog"))}function Ke(e){return e>=1&&e<=W?A.zoneLog[e]:A.activityLog}function Me(e,t){let r=A[e];if(!Array.isArray(r))return;let o=Ve(t);if(o!=null){for(r.push(o);r.length>Lt;)r.shift();q(I(e))}}function se(e){let t=Date.now();if(!e&&t-A.lastHistoryAt<3200)return;A.lastHistoryAt=t;let r=0,o=0;for(let a=1;a<=W;a++){let n=x("sensor-zone_"+a+"_valve_pct");n!=null&&(r+=n,o+=1)}Me("historyFlow",x("sensor-manifold_flow_temperature")),Me("historyReturn",x("sensor-manifold_return_temperature")),Me("historyDemand",o?r/o:0)}function Rt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function we(e){A.zoneStateHistory=e||null,q(I("zoneStateHistory"))}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},i={flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",heliosEnabled:"switch-helios_enabled",heliosHost:"text-helios_host",heliosPort:"number-helios_port",heliosControllerId:"text-helios_controller_id",heliosPollIntervalS:"number-helios_poll_interval_s",heliosStaleAfterS:"number-helios_stale_after_s",heliosStatus:"helios_status",heliosDeviceId:"text-helios_device_id"};var D=6,qt=8,Je=null,ie=0,S={temp:new Float32Array(D),setpoint:new Float32Array(D),valve:new Float32Array(D),enabled:new Uint8Array(D),driversEnabled:1,fault:0,manualMode:0};function Pt(){S.manualMode=0,K("manualMode",!1);for(let n=0;n<D;n++){S.temp[n]=20.5+n*.4,S.setpoint[n]=21+n%3*.5,S.valve[n]=12+n*8,S.enabled[n]=n===4?0:1;let s=n+1;c(l.temp(s),{value:S.temp[n]}),c(l.setpoint(s),{value:S.setpoint[n]}),c(l.valve(s),{value:S.valve[n]}),c(l.state(s),{state:S.valve[n]>5?"heating":"idle"}),c(l.enabled(s),{value:!!S.enabled[n],state:S.enabled[n]?"on":"off"}),c(l.probe(s),{state:"Probe "+s}),c(l.tempSource(s),{state:s%2?"Local Probe":"BLE Sensor"}),c(l.syncTo(s),{state:"None"}),c(l.pipeType(s),{state:"PEX 16mm"}),c(l.area(s),{value:8+s*3.5}),c(l.spacing(s),{value:[150,200,150,100,200,150][n]}),c(l.zigbee(s),{state:"zone_"+s+"_mock_sensor"}),c(l.ble(s),{state:"AA:BB:CC:DD:EE:0"+s}),c(l.exteriorWalls(s),{state:["N","E","S","W","N,E","S,W"][n]}),c(l.preheatAdvance(s),{value:.08+n*.03})}for(let n=1;n<=qt;n++){let s=n<=D?n:D,d=S.temp[s-1]+(n>D?1:.1*n);c(l.probeTemp(n),{value:d})}c(i.flow,{value:34.1}),c(i.ret,{value:30.4}),c(i.uptime,{value:18*3600+720}),c(i.wifi,{value:-57}),c(i.drivers,{value:!0,state:"on"}),c(i.fault,{value:!1,state:"off"}),c(i.ip,{state:"192.168.1.86"}),c(i.ssid,{state:"MockLab"}),c(i.mac,{state:"D8:3B:DA:12:34:56"}),c(i.firmware,{state:"0.5.x-mock"}),c(i.manifoldFlowProbe,{state:"Probe 7"}),c(i.manifoldReturnProbe,{state:"Probe 8"}),c(i.manifoldType,{state:"NC (Normally Closed)"}),c(i.motorProfileDefault,{state:"HmIP VdMot"}),c(i.closeThresholdMultiplier,{value:1.7}),c(i.closeSlopeThreshold,{value:1}),c(i.closeSlopeCurrentFactor,{value:1.4}),c(i.openThresholdMultiplier,{value:1.7}),c(i.openSlopeThreshold,{value:.8}),c(i.openSlopeCurrentFactor,{value:1.3}),c(i.openRippleLimitFactor,{value:1}),c(i.genericRuntimeLimitSeconds,{value:45}),c(i.hmipRuntimeLimitSeconds,{value:40}),c(i.relearnAfterMovements,{value:2e3}),c(i.relearnAfterHours,{value:168}),c(i.learnedFactorMinSamples,{value:3}),c(i.learnedFactorMaxDeviationPct,{value:12}),c(i.simplePreheatEnabled,{state:"on"}),se(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<r;n++){let s=(r-1-n)*e,d=t-s,g=Math.floor(n/12)%24,b=o.map(u=>u[g%u.length]);a.push([d,...b])}we({interval_s:e,uptime_s:t,count:r,entries:a})}function It(){ie+=1,c(i.uptime,{value:Number(Date.now()/1e3)|0}),c(i.wifi,{value:-55-Math.round((1+Math.sin(ie/4))*6)});let e=0,t=0,r=0;for(let s=0;s<D;s++){let d=s+1,g=!!S.enabled[s],b=S.temp[s],u=S.setpoint[s],f=g&&S.driversEnabled&&!S.manualMode&&b<u-.25;S.manualMode?S.valve[s]=Math.max(0,S.valve[s]):!g||!S.driversEnabled?S.valve[s]=Math.max(0,S.valve[s]-6):f?S.valve[s]=Math.min(100,S.valve[s]+7+d%3):S.valve[s]=Math.max(0,S.valve[s]-5);let z=f?.05+S.valve[s]/2200:-.03+S.valve[s]/3200;S.temp[s]=b+z+Math.sin((ie+d)/5)*.04,g&&S.valve[s]>0&&(e+=S.valve[s],t+=1,r=Math.max(r,S.valve[s])),c(l.temp(d),{value:S.temp[s]}),c(l.valve(d),{value:Math.round(S.valve[s])});let v=Math.max(0,(S.setpoint[s]-S.temp[s]-.15)*.22);c(l.preheatAdvance(d),{value:Number(v.toFixed(2))}),c(l.state(d),{state:g?f?"heating":"idle":"off"}),c(l.enabled(d),{value:g,state:g?"on":"off"}),c(l.probeTemp(d),{value:S.temp[s]+Math.sin((ie+d)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(ie/6)*.25,a=o-(t?2.1+e/Math.max(1,t*50):1.1);c(i.flow,{value:Number(o.toFixed(1))}),c(i.ret,{value:Number(a.toFixed(1))}),c(l.probeTemp(7),{value:Number((a-.4).toFixed(1))}),c(l.probeTemp(8),{value:Number((o+.2).toFixed(1))}),se(!0);let n=E("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0)}function Qe(){Je||(Pt(),J(!0),Je=setInterval(It,1200))}function _e(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=D){let n=Number(r);Number.isNaN(n)||(S.setpoint[o-1]=n,c(l.setpoint(o),{value:n}),k("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=D){let n=r>.5;S.enabled[o-1]=n?1:0,c(l.enabled(o),{value:n,state:n?"on":"off"}),k("Zone "+o+(n?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let n=r>.5;S.driversEnabled=n?1:0,c(i.drivers,{value:n,state:n?"on":"off"}),k(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=r>.5;S.manualMode=n?1:0,K("manualMode",n);return}if(t==="motor_target"&&o>=1&&o<=D){let n=Number(r||0);c(l.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),k("Motor "+o+" target set to "+n+"%",o);return}if(t==="command"){let n=String(r);if(n==="i2c_scan"){ee(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),k("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){k("Command executed: "+n);return}if(n==="open_motor_timed"&&o>=1&&o<=D){k("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=D){k("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=D){k("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=D){k("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=D){k("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=D){k("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){c(l.probe(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){c(l.tempSource(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){c(l.syncTo(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){c(l.pipeType(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){c(i.manifoldType,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){c(i.manifoldFlowProbe,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){c(i.manifoldReturnProbe,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){c(i.motorProfileDefault,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){c(i.simplePreheatEnabled,{state:String(r)}),k("Setting updated: "+t+" = "+r);return}if(t==="zone_zigbee_device"&&o>=1){c(l.zigbee(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_ble_mac"&&o>=1){c(l.ble(o),{state:String(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){c(l.exteriorWalls(o),{state:String(r)||"None"}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){c(l.area(o),{value:Number(r)}),k("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){c(l.spacing(o),{value:Number(r)}),k("Setting updated: "+t+" = "+r,o);return}let a={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct};if(a[t]){let n=Number(r);Number.isNaN(n)||(c(a[t],{value:n}),k("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){_e({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!S.enabled[e-1];_e({key:"zone_enabled",value:t?1:0,zone:e})}};var et="/dashboard";function tt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function N(e){if(Ue(),tt())try{return _e(e),Promise.resolve({ok:!0})}finally{Ne()}return fetch(et+"/set",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:(()=>{let t=new URLSearchParams;for(let[r,o]of Object.entries(e))o!=null&&t.append(r,o);return t.toString()})()}).finally(()=>{Ne()})}function De(e,t){return c(l.setpoint(e),{value:t}),N({key:"zone_setpoint",value:t,zone:e})}function ot(e,t){return c(l.enabled(e),{state:t?"on":"off",value:t}),N({key:"zone_enabled",value:t?1:0,zone:e})}function rt(e){return c(i.drivers,{state:e?"on":"off",value:e}),N({key:"drivers_enabled",value:e?1:0})}function le(e,t){return N({key:"command",value:e,zone:t||void 0})}function nt(){return ee("Scanning I2C bus..."),k("I2C scan started"),le("i2c_scan")}var Ht={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},Zt={zone_zigbee_device:e=>l.zigbee(e),zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e)},Wt={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},Bt={manifold_type:i.manifoldType,manifold_flow_probe:i.manifoldFlowProbe,manifold_return_probe:i.manifoldReturnProbe,motor_profile_default:i.motorProfileDefault,simple_preheat_enabled:i.simplePreheatEnabled,helios_enabled:i.heliosEnabled},jt={close_threshold_multiplier:i.closeThresholdMultiplier,close_slope_threshold:i.closeSlopeThreshold,close_slope_current_factor:i.closeSlopeCurrentFactor,open_threshold_multiplier:i.openThresholdMultiplier,open_slope_threshold:i.openSlopeThreshold,open_slope_current_factor:i.openSlopeCurrentFactor,open_ripple_limit_factor:i.openRippleLimitFactor,generic_runtime_limit_seconds:i.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:i.hmipRuntimeLimitSeconds,relearn_after_movements:i.relearnAfterMovements,relearn_after_hours:i.relearnAfterHours,learned_factor_min_samples:i.learnedFactorMinSamples,learned_factor_max_deviation_pct:i.learnedFactorMaxDeviationPct,helios_port:i.heliosPort,helios_poll_interval_s:i.heliosPollIntervalS,helios_stale_after_s:i.heliosStaleAfterS};function te(e,t,r){let o=Ht[t];return o&&c(o(e),{state:r}),N({key:t,value:r,zone:e})}function de(e,t,r){let o=Zt[t];return o&&c(o(e),{state:r}),N({key:t,value:r,zone:e})}function Te(e,t,r){let o=Number(r),a=Wt[t];return a&&!Number.isNaN(o)&&c(a(e),{value:o}),N({key:t,value:o,zone:e})}function B(e,t){let r=Bt[e];return r&&c(r,{state:t}),N({key:e,value:t})}function j(e,t){let r=Number(t),o=jt[e];return o&&!Number.isNaN(r)&&c(o,{value:r}),N({key:e,value:r})}function at(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return c(l.motorTarget(e),{value:o}),k("Motor "+e+" target set to "+o+"%",e),N({key:"motor_target",value:o,zone:e})}function st(e,t=1e4){return k("Motor "+e+" open for "+t+"ms",e),N({key:"command",value:"open_motor_timed",zone:e})}function it(e,t=1e4){return k("Motor "+e+" close for "+t+"ms",e),N({key:"command",value:"close_motor_timed",zone:e})}function Oe(e){return k("Motor "+e+" stopped",e),N({key:"command",value:"stop_motor",zone:e})}function Re(e){return K("manualMode",!!e),k(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),N({key:"manual_mode",value:e?1:0})}function lt(e){return k("Motor "+e+" fault reset",e),N({key:"command",value:"motor_reset_fault",zone:e})}function dt(e){return k("Motor "+e+" learned factors reset",e),N({key:"command",value:"motor_reset_learned_factors",zone:e})}function ct(e){return k("Motor "+e+" reset and relearn started",e),N({key:"command",value:"motor_reset_and_relearn",zone:e})}function qe(){tt()||fetch(et+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&we(e)}).catch(()=>{})}var Pe=null,ze=null,pt=null;async function Vt(){ze&&ze.abort(),ze=new AbortController;let e=await fetch("/dashboard/state",{cache:"no-store",signal:ze.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function ut(e){if(!(!e||typeof e!="object")&&!Xe()){for(let t in e)c(t,e[t]);se(!1)}}function Gt(e){if(e){if(!e.type){ut(e);return}if(e.type==="state"){ut(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;k(t),String(t).indexOf("I2C_SCAN:")!==-1&&ee(String(t))}}}function mt(){Pe||(Pe=setTimeout(()=>{Pe=null,Ie()},1e3))}function Ie(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Qe();return}Vt().then(t=>{J(!0),Gt(t),qe(),pt||(pt=setInterval(qe,300*1e3)),mt()}).catch(()=>{J(!1),mt()})}var gt=Object.create(null);function _(e,t){if(gt[e])return;gt[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function O(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function oe(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Se(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function bt(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var $t=`
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
`,qr=y({tag:"hv6-header",render:Ut,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),a=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),s=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function b(){let f=E("section");g.forEach(z=>{z.classList.toggle("active",z.getAttribute("data-section")===f)})}function u(){let f=E("live"),z=E("pendingWrites"),v=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":f?"Live":"Offline";r.textContent=v,o.classList.toggle("on",!!f),a.textContent=z>0?"Saving...":f?"Synced":"Offline";let p=z>0?"saving":f?"synced":"offline";a.className="meta-chip meta-chip-state "+p,n.textContent=Se(x(i.uptime)),s.textContent=bt(x(i.wifi));let h=E("firmwareVersion")||w(i.firmware);d.textContent=h?"FW "+h:""}g.forEach(f=>{f.addEventListener("click",z=>{z.preventDefault(),Ge(f.getAttribute("data-section"))})}),C("section",b),C("live",u),C("pendingWrites",u),C("firmwareVersion",u),m(i.uptime,u),m(i.wifi,u),m(i.firmware,u),b(),u()}});var Xt=`
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
`,jr=y({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Yt,methods:{update(e){this.motorDriversOn=R(i.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=R(i.fault)?"FAULT":"OK",this.connOn=E("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);m(i.drivers,o),m(i.fault,o),C("live",o),r.sw.onclick=()=>{rt(!e.motorDriversOn)},o()}});var Kt=`
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
`,Kr=y({tag:"connectivity-card",render:Jt,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function s(){r.textContent=w(i.ip)||"---",o.textContent=w(i.ssid)||"---",a.textContent=w(i.mac)||"---",n.textContent=Se(x(i.uptime))}m(i.ip,s),m(i.ssid,s),m(i.mac,s),m(i.uptime,s),s()}});var Qt=`
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
`;function ft(e,t,r,o){if(!e.length)return"";let a=Math.min.apply(null,e),n=Math.max.apply(null,e),s=Math.max(.001,n-a),d=e.length>1?(t-o*2)/(e.length-1):0,g="";for(let b=0;b<e.length;b++){let u=o+d*b,f=r-o-(e[b]-a)/s*(r-o*2);g+=(b?" L ":"M ")+u.toFixed(2)+" "+f.toFixed(2)}return g}function vt(e,t,r,o,a){e.innerHTML="";let n=ft(t,220,56,5);if(n){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",n),d.setAttribute("fill","none"),d.setAttribute("stroke",r),d.setAttribute("stroke-width","2.2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}let s=o&&o.length?ft(o,220,56,5):"";if(s){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",s),d.setAttribute("fill","none"),d.setAttribute("stroke",a),d.setAttribute("stroke-width","2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}}var to="var(--accent)",oo="var(--blue)",ro="var(--blue)",on=y({tag:"graph-widgets",render:eo,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand");function s(){let d=E("historyFlow"),g=E("historyReturn"),b=E("historyDemand"),u=d.length?d[d.length-1]:null,f=g.length?g[g.length-1]:null,z=b.length?b[b.length-1]:null;r.textContent=u!=null&&f!=null?(u-f).toFixed(1)+" C":"---",o.textContent=z!=null?Math.round(z)+"%":"---",vt(a,d,to,g,oo),vt(n,b,ro)}C("historyFlow",s),C("historyReturn",s),C("historyDemand",s),s()}});var X={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},xt=24*3600,pe=18,He=4,ce=54,ke=20,ue=4,Ee=W*(pe+He)-He+ue+ke,no=`
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
`;function so(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,a=o-xt,n=1e3,s=n-ce;function d(p){let h=(p-a)/xt;return ce+Math.max(0,Math.min(1,h))*s}let g="http://www.w3.org/2000/svg",b=document.createElementNS(g,"svg");b.setAttribute("viewBox","0 0 "+n+" "+Ee),b.classList.add("timeline-svg");let u=document.createElementNS(g,"rect");u.setAttribute("x",ce),u.setAttribute("y",ue),u.setAttribute("width",s),u.setAttribute("height",Ee-ue-ke),u.setAttribute("fill","rgba(10,24,46,0.55)"),u.setAttribute("rx","4"),b.appendChild(u);let f=[6,12,18,24];for(let p of f){let h=o-p*3600,L=d(h),F=document.createElementNS(g,"line");F.setAttribute("x1",L),F.setAttribute("y1",ue),F.setAttribute("x2",L),F.setAttribute("y2",Ee-ke),F.setAttribute("stroke","rgba(120,168,255,.12)"),F.setAttribute("stroke-width","1"),b.appendChild(F)}for(let p=0;p<W;p++){let h=ue+p*(pe+He),L=document.createElementNS(g,"rect");L.setAttribute("x",ce),L.setAttribute("y",h),L.setAttribute("width",s),L.setAttribute("height",pe),L.setAttribute("fill",p%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),b.appendChild(L);let F=document.createElementNS(g,"text");F.setAttribute("x",ce-4),F.setAttribute("y",h+pe/2+1),F.setAttribute("text-anchor","end"),F.setAttribute("dominant-baseline","middle"),F.setAttribute("fill","rgba(191,211,245,.65)"),F.setAttribute("font-size","9.5"),F.setAttribute("font-family","Montserrat, sans-serif"),F.setAttribute("font-weight","600"),F.textContent="Z"+(p+1),b.appendChild(F);let P=r.filter(T=>T[0]>=a).map(T=>({t:T[0],state:T[p+1]}));if(P.length===0)continue;let H=P[0].t,Y=P[0].state,ae=(T,Z,be)=>{if(be===255)return;let fe=X[be]||X[255];if(fe.color==="transparent")return;let ve=d(T),Ct=d(Z),At=Math.max(1,Ct-ve),$=document.createElementNS(g,"rect");$.setAttribute("x",ve),$.setAttribute("y",h+1),$.setAttribute("width",At),$.setAttribute("height",pe-2),$.setAttribute("fill",fe.color),$.setAttribute("rx","2"),$.setAttribute("opacity","0.88"),b.appendChild($)};for(let T=1;T<P.length;T++){let Z=P[T];Z.state!==Y&&(ae(H,Z.t,Y),H=Z.t,Y=Z.state)}ae(H,o,Y)}let z=Ee-ke+14,v=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let p of v){let h=o-p.hoursAgo*3600,L=d(h),F=document.createElementNS(g,"text");F.setAttribute("x",L),F.setAttribute("y",z),F.setAttribute("text-anchor",p.hoursAgo===0?"end":"middle"),F.setAttribute("fill","rgba(191,211,245,.45)"),F.setAttribute("font-size","9"),F.setAttribute("font-family","Montserrat, sans-serif"),F.textContent=p.label,b.appendChild(F)}return b}function io(e){e.innerHTML="";let t=[{code:5,...X[5]},{code:6,...X[6]},{code:0,...X[0]},{code:1,...X[1]},{code:7,...X[7]},{code:2,...X[2]}];for(let r of t){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(o)}}var dn=y({tag:"zone-state-timeline",render:ao,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");io(o);function a(){let n=E("zoneStateHistory"),s=(()=>{let g=E&&E("zoneStateHistory");return g&&g.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!n||!n.entries||n.entries.length===0){let g=document.createElement("div");g.className="timeline-empty",g.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(g);return}let d=so(n,s);d&&r.appendChild(d)}C("zoneStateHistory",a),C("zoneNames",a),a()}});var lo=`
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
`;_("zone-grid",lo);var co=()=>'<div class="zone-grid"></div>',mn=y({tag:"zone-grid",render:co,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(M("zone-card",{zone:r}))}});var po=`
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
		<div class="zc-zone-name">${Q(e.zone)}</div>
		<div class="zc-friendly">${U(e.zone)||"---"}</div>
	</div>
`,yn=y({tag:"zone-card",state:e=>({zone:e.zone}),render:uo,onMount(e,t){let r=e.zone,o=l.temp(r),a=l.state(r),n=l.enabled(r),s=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),g=t.querySelector(".zc-zone-name"),b=t.querySelector(".zc-friendly");function u(){let f=R(n),z=String(w(a)||"").toUpperCase()||"OFF",v=E("selectedZone")===r,p=U(r);g.textContent=Q(r),b.textContent=p||O(x(o)),s.textContent=f?z:"OFF";let h=f?z:"OFF",L=h==="HEATING"?"#f2c77b":h==="IDLE"?"#79d17e":h==="FAULT"?"#ff7676":"#7D8BA7",F=h==="HEATING"?"#EEA111":h==="IDLE"?"#79d17e":h==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";s.style.color=L,d.style.background=F,d.style.boxShadow=h==="HEATING"?"0 0 5px rgba(238,161,17,.6)":h==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",v),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&z==="HEATING"),t.classList.toggle("zs-idle",f&&z!=="HEATING"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{$e(r)}),m(o,u),m(a,u),m(n,u),C("selectedZone",u),C("zoneNames",u),u()}});var mo=`
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
      <div class="zd-title">${Q(e.zone)}</div>
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
`,Cn=y({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:go,methods:{update(e,t){let r=E("selectedZone"),o=String(w(l.state(r))||"").toUpperCase(),a=R(l.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=Q(r),t.setpoint.textContent=O(x(l.setpoint(r))),t.temp.textContent=O(x(l.temp(r))),t.ret.textContent=O(x("sensor-manifold_return_temperature")),t.valve.textContent=oe(x(l.valve(r)));let n=t.badge;n.textContent=a?o||"IDLE":"DISABLED";let s=a?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(s?" "+s:""),t.toggle.classList.toggle("on",a)},incSetpoint(){let e=this.zone,t=x(l.setpoint(e))||20;De(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=x(l.setpoint(e))||20;De(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=R(l.enabled(e));ot(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),a=n=>{let s=E("selectedZone");(n===l.temp(s)||n===l.setpoint(s)||n===l.valve(s)||n===l.state(s)||n===l.enabled(s))&&o()};for(let n=1;n<=6;n++)m(l.temp(n),a),m(l.setpoint(n),a),m(l.valve(n),a),m(l.state(n),a),m(l.enabled(n),a);m("sensor-manifold_return_temperature",o),C("selectedZone",o),o()}});var bo=`
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
  `};function vo(e,t){let r=e.value,o="<option>None</option>";for(let a=1;a<=6;a++)a!==t&&(o+="<option>Zone "+a+"</option>");e.innerHTML=o,e.value=r||"None"}var On=y({tag:"zone-sensor-card",render:fo,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),a=t.querySelector(".zs-zigbee"),n=t.querySelector(".zs-ble"),s=t.querySelector(".zs-sync"),d=t.querySelector(".zs-row-zigbee"),g=t.querySelector(".zs-row-ble"),b=0;function u(){return E("selectedZone")}function f(){let v=u();b!==v&&(vo(s,v),b=v);let p=w(l.probe(v)),h=w(l.tempSource(v))||"Local Probe",L=w(l.syncTo(v))||"None",F=w(l.zigbee(v))||"",P=w(l.ble(v))||"";p&&(r.value=p),o.value=h,s.value=L,document.activeElement!==a&&(a.value=F),document.activeElement!==n&&(n.value=P),d.style.display=h==="Zigbee MQTT"?"":"none",g.style.display=h==="BLE Sensor"?"":"none"}function z(v){let p=u();(v===l.probe(p)||v===l.tempSource(p)||v===l.syncTo(p)||v===l.zigbee(p)||v===l.ble(p))&&f()}r.addEventListener("change",()=>{te(u(),"zone_probe",r.value)}),o.addEventListener("change",()=>{te(u(),"zone_temp_source",o.value)}),s.addEventListener("change",()=>{te(u(),"zone_sync_to",s.value)}),a.addEventListener("change",()=>{de(u(),"zone_zigbee_device",a.value)}),n.addEventListener("change",()=>{de(u(),"zone_ble_mac",n.value)}),C("selectedZone",f);for(let v=1;v<=6;v++)m(l.probe(v),z),m(l.tempSource(v),z),m(l.syncTo(v),z),m(l.zigbee(v),z),m(l.ble(v),z);f()}});var xo=`
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
`,Wn=y({tag:"zone-room-card",render:ho,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),s=t.querySelectorAll(".wall-btn");function d(){return E("selectedZone")}function g(){let u=d();document.activeElement!==r&&(r.value=U(u)||""),document.activeElement!==o&&(o.value=x(l.area(u))!=null?String(x(l.area(u))):""),document.activeElement!==a&&(a.value=x(l.spacing(u))!=null?String(x(l.spacing(u))):""),n.value=w(l.pipeType(u))||"Unknown";let f=w(l.exteriorWalls(u))||"None",z=f==="None"?[]:f.split(",").filter(Boolean);s.forEach(v=>{let p=v.dataset.wall;v.classList.toggle("active",p==="None"?z.length===0:z.includes(p))})}function b(u){let f=d();(u===l.area(f)||u===l.spacing(f)||u===l.pipeType(f)||u===l.exteriorWalls(f))&&g()}r.addEventListener("change",()=>{Ye(d(),r.value)}),o.addEventListener("change",()=>{Te(d(),"zone_area_m2",o.value)}),a.addEventListener("change",()=>{Te(d(),"zone_pipe_spacing_mm",a.value||"200")}),n.addEventListener("change",()=>{te(d(),"zone_pipe_type",n.value)}),s.forEach(u=>{u.addEventListener("click",()=>{let f=u.dataset.wall,z=w(l.exteriorWalls(d()))||"None",v=z==="None"?[]:z.split(",").filter(Boolean);if(f==="None")v=[];else{let h=v.indexOf(f);h>=0?v.splice(h,1):v.push(f)}let p=["N","S","E","W"].filter(h=>v.includes(h));de(d(),"zone_exterior_walls",p.length?p.join(","):"None")})}),C("selectedZone",g),C("zoneNames",g);for(let u=1;u<=6;u++)m(l.area(u),b),m(l.spacing(u),b),m(l.pipeType(u),b),m(l.exteriorWalls(u),b);g()}});var yo=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
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
`;_("flow-diagram",yo);var V=6,_t=[60,126,192,258,324,390],Ae=225,re=36,ge=160,Fe=90,me=re+ge,G=640,wo=11,We=6,Be=24,Ze=G+20,ht=G+210,yt=G+328,wt=G+420,zt="#7D8BA7",St="#6C7892",_o="#8FCBFF",zo="#BCDFFF",So="#E4D092",Eo="#F2B74C",ko="#8FCBFF",Fo="#D8E7FF",Co="#7D8BA7",Ao="#B7CBF0",Lo="#6C7892",Ce="#A3B6D9",Mo="#8EA4CD",No="#42A5F5",Do="#66BB6A",To="#EF5350";function Le(e,t,r){var o=Ae+(e-2.5)*wo,a=_t[e],n=G-me,s=me+n*.33,d=me+n*.67;return"M"+me+" "+(o-t).toFixed(1)+" C"+s+" "+(o-t).toFixed(1)+" "+d+" "+(a-r).toFixed(1)+" "+G+" "+(a-r).toFixed(1)+" L"+G+" "+(a+r).toFixed(1)+" C"+d+" "+(a+r).toFixed(1)+" "+s+" "+(o+t).toFixed(1)+" "+me+" "+(o+t).toFixed(1)+"Z"}function Oo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function Ro(e){let t=String(U(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function qo(e,t){return t?e==null||Number.isNaN(e)?St:e<.15?_o:e<.4?zo:e<.7?So:Eo:zt}function Po(){var e=1160,t=460,r=Ae-Fe/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var a=1;a<=V;a++)o.push('<linearGradient id="rg'+a+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+a+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+a+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=V;n++){var s=Le(n-1,We,Be);o.push('<path d="'+s+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=V;n++){var d=Le(n-1,We,Be);o.push('<path id="fd-path-'+n+'" d="'+d+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+G+'" y1="36" x2="'+G+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var g=5,b=re-g;for(o.push('<rect x="0" y="'+r+'" width="'+b+'" height="'+Fe+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+re+'" y="'+r+'" width="'+ge+'" height="'+Fe+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(re+ge/2)+'" y="'+(Ae-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(re+ge/2)+'" y="'+(Ae+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(re+ge/2)+'" y="'+(r+Fe+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Ze+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+ht+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+yt+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+wt+'" y="34" font-size="11" fill="'+Ce+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=V;n++){var u=_t[n-1];o.push('<text id="fd-zn'+n+'" x="'+Ze+'" y="'+(u+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),o.push('<text id="fd-zf'+n+'" x="'+Ze+'" y="'+(u+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zt'+n+'" x="'+ht+'" y="'+(u+10)+'" font-size="19" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+n+'" x="'+yt+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+n+'" x="'+wt+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Mo+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+V+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var Io=()=>`<div class="flow-wrap">${Po()}</div>`;y({tag:"flow-diagram",render:Io,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(V+1)};for(let a=1;a<=V;a++)r.zones[a]={textTemp:t.querySelector("#fd-zt"+a),textFlow:t.querySelector("#fd-zv"+a),textRet:t.querySelector("#fd-zr"+a),label:t.querySelector("#fd-zn"+a),friendly:t.querySelector("#fd-zf"+a),path:t.querySelector("#fd-path-"+a)};function o(){let a=x(i.flow),n=x(i.ret),s=r.flowEl,d=r.retEl,g=r.dtEl;if(s.textContent=O(a),d.textContent="RET "+O(n),a!=null&&n!=null){let b=Number(a)-Number(n);g.textContent=b.toFixed(1)+"\xB0C",g.setAttribute("fill",b<3?No:b>8?To:Do)}else g.textContent="---";for(let b=1;b<=V;b++){let u=x(l.temp(b)),f=x(l.valve(b)),z=R(l.enabled(b)),v=String(w(l.tempSource(b))||"Local Probe"),p=Oo(w(l.probe(b))||""),h=p?x(l.probeTemp(p)):null,L=r.zones[b],F=L.textTemp,P=L.textFlow,H=L.textRet,Y=L.label,ae=L.friendly,T=L.path,Z=f!=null?Math.max(0,Math.min(100,Number(f)))/100:0;Y.textContent="ZONE "+b;let be=Ro(b);if(ae.textContent=be||"---",Y.setAttribute("fill",z?Fo:Co),ae.setAttribute("fill",z?Ao:Lo),F.textContent=O(u),P.textContent=oe(f),P.setAttribute("fill",qo(Z,z)),v!=="Local Probe"&&h!=null&&!Number.isNaN(Number(h))?(H.textContent=O(h),H.setAttribute("fill",z?ko:zt)):(H.textContent="---",H.setAttribute("fill",St)),!z)T.setAttribute("d",Le(b-1,1,2)),T.setAttribute("fill","#2A2D38"),T.setAttribute("opacity","0.4");else{let fe=Math.max(3,Z*Be),ve=Math.max(1.5,Z*We);T.setAttribute("d",Le(b-1,ve,fe)),T.setAttribute("fill","url(#rg"+b+")"),T.setAttribute("opacity","1")}}}m(i.flow,o),m(i.ret,o),C("zoneNames",o);for(let a=1;a<=V;a++)m(l.temp(a),o),m(l.valve(a),o),m(l.enabled(a),o),m(l.probe(a),o),m(l.tempSource(a),o);for(let a=1;a<=8;a++)m(l.probeTemp(a),o);o()}});var Ho=`
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
}`;_("diag-i2c",Ho);var Zo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Qn=y({tag:"diag-i2c",render:Zo,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=E("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{nt()}),C("i2cResult",o),o()}});var Wo=`
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
`;_("diag-zone",Wo);function Bo(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function Et(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function kt(e){return e!=null?Number(e).toFixed(0):"---"}function jo(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var Vo=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
  `},sa=y({tag:"diag-zone",render:Vo,onMount(e,t){function r(a){let n=String(w(l.state(a))||"").toUpperCase()||"OFF",s=R(l.enabled(a)),d=t.querySelector('[data-dz-state="'+a+'"]');d.textContent=s?n:"OFF",d.className="dz-state-badge"+(s?" "+Bo(n):""),t.querySelector('[data-dz-temp="'+a+'"]').textContent=O(x(l.temp(a))),t.querySelector('[data-dz-valve="'+a+'"]').textContent=oe(x(l.valve(a))),t.querySelector('[data-dz-ret="'+a+'"]').textContent=O(x(i.ret)),t.querySelector('[data-dz-orip="'+a+'"]').textContent=kt(x(l.motorOpenRipples(a))),t.querySelector('[data-dz-crip="'+a+'"]').textContent=kt(x(l.motorCloseRipples(a))),t.querySelector('[data-dz-ofac="'+a+'"]').textContent=Et(x(l.motorOpenFactor(a))),t.querySelector('[data-dz-cfac="'+a+'"]').textContent=Et(x(l.motorCloseFactor(a))),t.querySelector('[data-dz-ph="'+a+'"]').textContent=jo(x(l.preheatAdvance(a)));let g=String(w(l.motorLastFault(a))||"").toUpperCase(),b=g&&g!=="NONE"&&g!=="OK",u=t.querySelector('[data-dz-faultrow="'+a+'"]');u.style.display=b?"flex":"none",b&&(t.querySelector('[data-dz-fault="'+a+'"]').textContent=g)}for(let a=1;a<=6;a++){let n=a,s=()=>r(n);m(l.state(n),s),m(l.enabled(n),s),m(l.temp(n),s),m(l.valve(n),s),m(i.ret,s),m(l.motorOpenRipples(n),s),m(l.motorCloseRipples(n),s),m(l.motorOpenFactor(n),s),m(l.motorCloseFactor(n),s),m(l.preheatAdvance(n),s),m(l.motorLastFault(n),s),r(n)}function o(){let a=t.querySelector("[data-preheat-badge]"),n=a.querySelector(".card-title-preheat-dot"),s=a.querySelector("span:last-child"),g=(w(i.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";a.classList.toggle("on",g),a.classList.toggle("off",!g),n.classList.toggle("on",g),n.classList.toggle("off",!g),s.textContent=g?"Preheat: On":"Preheat: Off"}m(i.simplePreheatEnabled,o),o()}});var Go=`
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
`;function Uo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var pa=y({tag:"diag-activity",render:$o,onMount(e,t){let r=t.querySelector(".diag-log");function o(){Uo(r,Ke())}C("activityLog",o),o()}});var Xo=`
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
`,fa=y({tag:"diag-manual-badge",render:Yo,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let a=!!E("manualMode");r&&r.classList.toggle("on",a)}C("manualMode",o),o()}});var Ko=`
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
`;_("diag-zone-motor",Ko);var Jo=e=>{let t=e.zone||E("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},za=y({tag:"diag-zone-motor-card",render:Jo,onMount(e,t){let r=Number(e.zone||E("selectedZone")||1),o=!!E("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),g=t.querySelector(".motor-open-btn"),b=t.querySelector(".motor-close-btn"),u=t.querySelector(".motor-stop-btn");function f(p){o=!!p,a&&(a.classList.toggle("on",o),a.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[s,d,g,b,u].forEach(h=>{h&&(h.disabled=!o)})}function z(){let p=!o;if(f(p),p){Re(!0);for(let h=1;h<=6;h++)Oe(h)}else Re(!1)}function v(){let p=x(l.motorTarget(r));d&&p!=null?d.value=Number(p).toFixed(0):d&&(d.value="0")}s==null||s.addEventListener("change",()=>{r=Number(s.value||1),v()}),a==null||a.addEventListener("click",z),a==null||a.addEventListener("keydown",p=>{p.key!==" "&&p.key!=="Enter"||(p.preventDefault(),z())});for(let p=1;p<=6;p++)m(l.motorTarget(p),v);v(),f(o),C("manualMode",()=>{f(!!E("manualMode"))}),d==null||d.addEventListener("change",p=>{if(!o)return;let h=p.target.value;at(r,h)}),g==null||g.addEventListener("click",()=>{o&&st(r,1e4)}),b==null||b.addEventListener("click",()=>{o&&it(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Oe(r)})}});var Qo=`
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
`;_("diag-zone-recovery",Qo);var er=e=>{let t=e.zone||E("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Aa=y({tag:"diag-zone-recovery-card",render:er,onMount(e,t){let r=Number(e.zone||E("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),a=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),s=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),a==null||a.addEventListener("click",()=>{lt(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&dt(r)}),s==null||s.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&ct(r)})}});var tr=`
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
  `},qa=y({tag:"settings-manifold-card",render:or,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret");function n(){r.value=w(i.manifoldType)||"NC (Normally Closed)",o.value=w(i.manifoldFlowProbe)||"Probe 7",a.value=w(i.manifoldReturnProbe)||"Probe 8";for(let s=1;s<=8;s++){let d=t.querySelector('[data-probe="'+s+'"]'),g=x(l.probeTemp(s));d&&(d.textContent=O(g))}}r.addEventListener("change",()=>B("manifold_type",r.value)),o.addEventListener("change",()=>B("manifold_flow_probe",o.value)),a.addEventListener("change",()=>B("manifold_return_probe",a.value)),m(i.manifoldType,n),m(i.manifoldFlowProbe,n),m(i.manifoldReturnProbe,n);for(let s=1;s<=8;s++)m(l.probeTemp(s),n);n()}});var rr=`
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
`,Ga=y({tag:"settings-control-card",render:nr,onMount(e,t){let r=t.querySelector(".sc-simple-preheat"),o=r.querySelector(".preheat-state"),a=r.querySelector(".preheat-action");function n(){let d=String(w(i.simplePreheatEnabled)||"").toLowerCase();return d==="on"||d==="true"||d==="1"||d==="enabled"}function s(){let d=n();r.classList.toggle("is-on",d),r.classList.toggle("is-off",!d),o.textContent="Simple Preheat: "+(d?"ENABLED":"DISABLED"),a.textContent=d?"Tap to disable":"Tap to enable"}r.addEventListener("click",()=>{let d=!n();B("simple_preheat_enabled",d?"on":"off")}),m(i.simplePreheatEnabled,s),s(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{le("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{le("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{le("restart")})}});var ar=`
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
`;_("settings-motor-calibration-card",ar);var ne=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:i.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:i.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:i.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:i.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:i.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:i.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:i.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:i.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:i.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:i.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:i.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:i.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],sr=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<ne.length;r++){let o=ne[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function ir(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function Ft(e,t){let r=Number(t);return Number.isFinite(r)?ir(e)?String(Math.round(r)):r.toFixed(2):"0"}var Qa=y({tag:"settings-motor-calibration-card",render:sr,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function a(s){if(s==="HmIP VdMot"&&j("hmip_runtime_limit_seconds",40),s==="Generic"){let d=Number(x(i.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&j("generic_runtime_limit_seconds",45)}}function n(){let s=w(i.motorProfileDefault)||"HmIP VdMot";r&&(r.value=s),o&&(s==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=Ft("generic_runtime_limit_seconds",x(i.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<ne.length;d++){let g=ne[d],b=t.querySelector(".smc-"+g.cls);b&&g.key!=="generic_runtime_limit_seconds"&&(b.value=Ft(g.key,x(g.id)))}}r&&(r.addEventListener("change",()=>{B("motor_profile_default",r.value),a(r.value)}),m(i.motorProfileDefault,n));for(let s=0;s<ne.length;s++){let d=ne[s],g=t.querySelector(".smc-"+d.cls);g&&(g.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((w(i.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;j("generic_runtime_limit_seconds",g.value);return}j(d.key,g.value)}),m(d.id,n))}m(i.genericRuntimeLimitSeconds,n),m(i.hmipRuntimeLimitSeconds,n),a(w(i.motorProfileDefault)||"HmIP VdMot"),n()}});var lr=`
.settings-helios-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-helios-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.settings-helios-card .helios-status-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}

.settings-helios-card .helios-status-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}

.settings-helios-card .helios-status-badge.degraded {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border: 1px solid rgba(255,200,50,.35);
}

.settings-helios-card .helios-status-badge.offline {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-helios-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 5px;
  margin-bottom: 10px;
}

.settings-helios-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
}

.settings-helios-card .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.settings-helios-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-helios-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.settings-helios-card .enable-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-helios-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-helios-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-helios-card .enable-toggle {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: .78rem;
  font-weight: 800;
  letter-spacing: .5px;
  text-transform: uppercase;
  cursor: pointer;
  transition: .18s ease;
  flex-shrink: 0;
}

.settings-helios-card .enable-row.is-on .enable-toggle {
  border-color: rgba(255,100,100,.5);
  background: rgba(255,80,80,.2);
  color: #FFD0D0;
}

.settings-helios-card .enable-row.is-off .enable-toggle {
  border-color: rgba(100,255,100,.5);
  background: rgba(45,110,45,.3);
  color: #CBFFD0;
}

.settings-helios-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 14px 0 8px;
}

.settings-helios-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 3px;
  line-height: 1.4;
}
`;_("settings-helios-card",lr);var dr=()=>`
  <div class="settings-helios-card">
    <div class="card-title">
      <span>Helios Integration</span>
      <span class="helios-status-badge offline">offline</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Integration enabled</span>
      <button class="enable-toggle">Enable</button>
    </div>

    <div class="section-title">Connection</div>
    <div class="cfg-row">
      <span class="lbl">Host</span>
      <input class="inp sh-host" type="text" placeholder="192.168.1.x or hostname" maxlength="63" />
    </div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sh-port" type="number" min="1" max="65535" step="1" placeholder="8080" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Controller ID</span>
        <input class="inp sh-cid" type="text" maxlength="32" />
        <span class="note sh-cid-note">Leave blank to use device ID</span>
      </div>
    </div>

    <div class="section-title">Timing</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Poll interval (s)</span>
        <input class="inp sh-poll" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Stale after (s)</span>
        <input class="inp sh-stale" type="number" min="10" max="86400" step="1" placeholder="600" />
        <span class="note">Clear Helios commands when no contact for this long</span>
      </div>
    </div>
  </div>
`,ss=y({tag:"settings-helios-card",render:dr,onMount(e,t){let r=t.querySelector(".helios-status-badge"),o=t.querySelector(".enable-row"),a=t.querySelector(".enable-toggle"),n=t.querySelector(".sh-host"),s=t.querySelector(".sh-port"),d=t.querySelector(".sh-cid"),g=t.querySelector(".sh-cid-note"),b=t.querySelector(".sh-poll"),u=t.querySelector(".sh-stale");function f(){let p=w(i.heliosStatus)||"offline";r.textContent=p,r.className="helios-status-badge "+p}function z(){let p=R(i.heliosEnabled);o.classList.toggle("is-on",p),o.classList.toggle("is-off",!p),a.textContent=p?"Disable":"Enable"}a.addEventListener("click",()=>{let p=!R(i.heliosEnabled);c(i.heliosEnabled,{state:p?"on":"off"}),B("helios_enabled",p?"on":"off")}),n.addEventListener("blur",()=>{let p=n.value.trim();c(i.heliosHost,{state:p}),N({key:"helios_host",value:p})}),d.addEventListener("blur",()=>{let p=d.value.trim();c(i.heliosControllerId,{state:p}),N({key:"helios_controller_id",value:p})}),s.addEventListener("blur",()=>{let p=parseInt(s.value,10);p>=1&&p<=65535&&(c(i.heliosPort,{value:p}),j("helios_port",p))}),b.addEventListener("blur",()=>{let p=parseInt(b.value,10);p>=5&&p<=3600&&(c(i.heliosPollIntervalS,{value:p}),j("helios_poll_interval_s",p))}),u.addEventListener("blur",()=>{let p=parseInt(u.value,10);p>=10&&p<=86400&&(c(i.heliosStaleAfterS,{value:p}),j("helios_stale_after_s",p))});function v(){let p=w(i.heliosHost),h=w(i.heliosControllerId),L=w(i.heliosDeviceId)||"heatvalve-6",F=x(i.heliosPort),P=x(i.heliosPollIntervalS),H=x(i.heliosStaleAfterS);document.activeElement!==n&&p!=null&&(n.value=p),document.activeElement!==d&&(h!=null&&(d.value=h),d.placeholder=L,g.textContent="Leave blank to use device ID: "+L),document.activeElement!==s&&F!=null&&(s.value=F||8080),document.activeElement!==b&&P!=null&&(b.value=P||30),document.activeElement!==u&&H!=null&&(u.value=H||600)}m(i.heliosStatus,f),m(i.heliosEnabled,z),m(i.heliosHost,v),m(i.heliosControllerId,v),m(i.heliosDeviceId,v),m(i.heliosPort,v),m(i.heliosPollIntervalS,v),m(i.heliosStaleAfterS,v),f(),z(),v()}});var cr=`
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
`;_("app-root",cr);var pr=e=>`
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
          <div class="settings-helios-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;y({tag:"app-root",render:pr,onMount(e,t){t.querySelector(".hdr").appendChild(M("hv6-header")),t.querySelector(".overview-flow").appendChild(M("flow-diagram")),t.querySelector(".overview-status").appendChild(M("status-card")),t.querySelector(".overview-connectivity").appendChild(M("connectivity-card")),t.querySelector(".overview-graphs").appendChild(M("graph-widgets")),t.querySelector(".overview-timeline").appendChild(M("zone-state-timeline")),t.querySelector(".zone-selector").appendChild(M("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(M("zone-detail",{zone:E("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(M("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(M("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(M("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(M("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(M("settings-motor-calibration-card")),t.querySelector(".settings-helios-slot").appendChild(M("settings-helios-card")),t.querySelector(".diag-manual-badge-slot").appendChild(M("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(M("diag-i2c")),r.appendChild(M("diag-activity")),r.appendChild(M("diag-zone"));let o=E("selectedZone")||1;r.appendChild(M("diag-zone-motor-card",{zone:o})),r.appendChild(M("diag-zone-recovery-card",{zone:o}));let a=t.querySelectorAll(".sec");function n(){let s=E("section");a.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===s)})}C("section",n),n()}});function ur(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(M("app-root")),Ie()}ur();})();

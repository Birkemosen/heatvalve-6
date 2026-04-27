(()=>{var Ue={},he={};function y(e){return Ue[e.tag]=e,e}function M(e,t){let r=Ue[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let i=r.state(t||{});for(let d in i)o[d]=i[d]}if(r.methods)for(let i in r.methods)o[i]=r.methods[i];let a=document.createElement("div");a.innerHTML=r.render(o);let n=a.firstElementChild;return r.onMount&&r.onMount(o,n),n}function m(e,t){(he[e]||(he[e]=[])).push(t)}function q(e){let t=he[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var B=6,qt=28,ye=Object.create(null),Pt=Ht(),L={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:It(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Pt,manualMode:!1,zoneStateHistory:null};function It(){let e=Object.create(null);for(let t=1;t<=B;t++)e[t]=[];return e}function Ht(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<B;)e.push("");return e.slice(0,B)}function Zt(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(L.zoneNames))}catch(e){}}function I(e){return"$dashboard:"+e}function we(e){return Math.max(1,Math.min(B,Number(e)||1))}function Xe(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function x(e){let t=ye[e];return t?t.v!=null?t.v:t.value!=null?t.value:Xe(t.s!=null?t.s:t.state):null}function h(e){let t=ye[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Wt(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function T(e){return Wt(h(e))}function p(e,t){let r=ye[e];r||(r=ye[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);q(e),e==="text_sensor-firmware_version"&&te("firmwareVersion",h(e)||"")}function C(e,t){m(I(e),t)}function S(e){return L[e]}function te(e,t){L[e]=t,q(I(e))}function Qe(e){L.section!==e&&(L.section=e,q(I("section")))}function Ye(e){let t=we(e);L.selectedZone!==t&&(L.selectedZone=t,q(I("selectedZone")))}function oe(e){let t=!!e;L.live!==t&&(L.live=t,q(I("live")))}function Ke(){L.pendingWrites+=1,q(I("pendingWrites"))}function Re(){L.pendingWrites=Math.max(0,L.pendingWrites-1),L.lastWriteAt=Date.now(),q(I("pendingWrites"))}function Je(){return L.pendingWrites>0?!0:Date.now()-L.lastWriteAt<2e3}function et(e,t){let r=we(e)-1;L.zoneNames[r]=String(t||"").trim(),Zt(),q(I("zoneNames"))}function Y(e){return L.zoneNames[we(e)-1]||""}function re(e){let t=we(e),r=Y(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ne(e){L.i2cResult=e||"No scan has been run yet.",q(I("i2cResult"))}function F(e,t){let r={time:Bt(),msg:String(e||"")};for(L.activityLog.push(r);L.activityLog.length>60;)L.activityLog.shift();if(t>=1&&t<=B){let o=L.zoneLog[t];for(o.push(r);o.length>8;)o.shift();q(I("zoneLog:"+t))}q(I("activityLog"))}function tt(e){return e>=1&&e<=B?L.zoneLog[e]:L.activityLog}function Oe(e,t){let r=L[e];if(!Array.isArray(r))return;let o=Xe(t);if(o!=null){for(r.push(o);r.length>qt;)r.shift();q(I(e))}}function le(e){let t=Date.now();if(!e&&t-L.lastHistoryAt<3200)return;L.lastHistoryAt=t;let r=0,o=0;for(let a=1;a<=B;a++){let n=x("sensor-zone_"+a+"_valve_pct");n!=null&&(r+=n,o+=1)}Oe("historyFlow",x("sensor-manifold_flow_temperature")),Oe("historyReturn",x("sensor-manifold_return_temperature")),Oe("historyDemand",o?r/o:0)}function Bt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function ze(e){L.zoneStateHistory=e||null,q(I("zoneStateHistory"))}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",zigbee:e=>"text-zone_"+e+"_zigbee_device",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature"},s={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",heliosEnabled:"switch-helios_enabled",heliosHost:"text-helios_host",heliosPort:"number-helios_port",heliosControllerId:"text-helios_controller_id",heliosPollIntervalS:"number-helios_poll_interval_s",heliosStaleAfterS:"number-helios_stale_after_s",heliosStatus:"helios_status",heliosDeviceId:"text-helios_device_id"};var D=6,Vt=8,ot=null,de=0,_={temp:new Float32Array(D),setpoint:new Float32Array(D),valve:new Float32Array(D),enabled:new Uint8Array(D),driversEnabled:1,fault:0,manualMode:0};function jt(){_.manualMode=0,te("manualMode",!1);for(let n=0;n<D;n++){_.temp[n]=20.5+n*.4,_.setpoint[n]=21+n%3*.5,_.valve[n]=12+n*8,_.enabled[n]=n===4?0:1;let i=n+1;p(l.temp(i),{value:_.temp[n]}),p(l.setpoint(i),{value:_.setpoint[n]}),p(l.valve(i),{value:_.valve[n]}),p(l.state(i),{state:_.valve[n]>5?"heating":"idle"}),p(l.enabled(i),{value:!!_.enabled[n],state:_.enabled[n]?"on":"off"}),p(l.probe(i),{state:"Probe "+i}),p(l.tempSource(i),{state:i%2?"Local Probe":"BLE"}),p(l.syncTo(i),{state:"None"}),p(l.pipeType(i),{state:"PEX 16mm"}),p(l.area(i),{value:8+i*3.5}),p(l.spacing(i),{value:[150,200,150,100,200,150][n]}),p(l.zigbee(i),{state:"zone_"+i+"_mock_sensor"}),p(l.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),p(l.exteriorWalls(i),{state:["N","E","S","W","N,E","S,W"][n]}),p(l.preheatAdvance(i),{value:.08+n*.03})}for(let n=1;n<=Vt;n++){let i=n<=D?n:D,d=_.temp[i-1]+(n>D?1:.1*n);p(l.probeTemp(n),{value:d})}p(s.flow,{value:34.1}),p(s.ret,{value:30.4}),p(s.uptime,{value:18*3600+720}),p(s.wifi,{value:-57}),p(s.drivers,{value:!0,state:"on"}),p(s.fault,{value:!1,state:"off"}),p(s.ip,{state:"192.168.1.86"}),p(s.ssid,{state:"MockLab"}),p(s.mac,{state:"D8:3B:DA:12:34:56"}),p(s.firmware,{state:"0.5.x-mock"}),p(s.manifoldFlowProbe,{state:"Probe 7"}),p(s.manifoldReturnProbe,{state:"Probe 8"}),p(s.manifoldType,{state:"NC (Normally Closed)"}),p(s.motorProfileDefault,{state:"HmIP VdMot"}),p(s.closeThresholdMultiplier,{value:1.7}),p(s.closeSlopeThreshold,{value:1}),p(s.closeSlopeCurrentFactor,{value:1.4}),p(s.openThresholdMultiplier,{value:1.7}),p(s.openSlopeThreshold,{value:.8}),p(s.openSlopeCurrentFactor,{value:1.3}),p(s.openRippleLimitFactor,{value:1}),p(s.genericRuntimeLimitSeconds,{value:45}),p(s.hmipRuntimeLimitSeconds,{value:40}),p(s.relearnAfterMovements,{value:2e3}),p(s.relearnAfterHours,{value:168}),p(s.learnedFactorMinSamples,{value:3}),p(s.learnedFactorMaxDeviationPct,{value:12}),p(s.simplePreheatEnabled,{state:"on"}),le(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let n=0;n<r;n++){let i=(r-1-n)*e,d=t-i,g=Math.floor(n/12)%24,b=o.map(u=>u[g%u.length]);a.push([d,...b])}ze({interval_s:e,uptime_s:t,count:r,entries:a})}function Gt(){de+=1,p(s.uptime,{value:Number(Date.now()/1e3)|0}),p(s.wifi,{value:-55-Math.round((1+Math.sin(de/4))*6)});let e=0,t=0,r=0;for(let i=0;i<D;i++){let d=i+1,g=!!_.enabled[i],b=_.temp[i],u=_.setpoint[i],f=g&&_.driversEnabled&&!_.manualMode&&b<u-.25;_.manualMode?_.valve[i]=Math.max(0,_.valve[i]):!g||!_.driversEnabled?_.valve[i]=Math.max(0,_.valve[i]-6):f?_.valve[i]=Math.min(100,_.valve[i]+7+d%3):_.valve[i]=Math.max(0,_.valve[i]-5);let E=f?.05+_.valve[i]/2200:-.03+_.valve[i]/3200;_.temp[i]=b+E+Math.sin((de+d)/5)*.04,g&&_.valve[i]>0&&(e+=_.valve[i],t+=1,r=Math.max(r,_.valve[i])),p(l.temp(d),{value:_.temp[i]}),p(l.valve(d),{value:Math.round(_.valve[i])});let k=Math.max(0,(_.setpoint[i]-_.temp[i]-.15)*.22);p(l.preheatAdvance(d),{value:Number(k.toFixed(2))}),p(l.state(d),{state:g?f?"heating":"idle":"off"}),p(l.enabled(d),{value:g,state:g?"on":"off"}),p(l.probeTemp(d),{value:_.temp[i]+Math.sin((de+d)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(de/6)*.25,a=o-(t?2.1+e/Math.max(1,t*50):1.1);p(s.flow,{value:Number(o.toFixed(1))}),p(s.ret,{value:Number(a.toFixed(1))}),p(l.probeTemp(7),{value:Number((a-.4).toFixed(1))}),p(l.probeTemp(8),{value:Number((o+.2).toFixed(1))}),le(!0);let n=S("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0)}function rt(){ot||(jt(),oe(!0),ot=setInterval(Gt,1200))}function _e(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=D){let n=Number(r);Number.isNaN(n)||(_.setpoint[o-1]=n,p(l.setpoint(o),{value:n}),F("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=D){let n=r>.5;_.enabled[o-1]=n?1:0,p(l.enabled(o),{value:n,state:n?"on":"off"}),F("Zone "+o+(n?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let n=r>.5;_.driversEnabled=n?1:0,p(s.drivers,{value:n,state:n?"on":"off"}),F(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=r>.5;_.manualMode=n?1:0,te("manualMode",n);return}if(t==="motor_target"&&o>=1&&o<=D){let n=Number(r||0);p(l.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),F("Motor "+o+" target set to "+n+"%",o);return}if(t==="command"){let n=String(r);if(n==="i2c_scan"){ne(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),F("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){F("Command executed: "+n);return}if(n==="open_motor_timed"&&o>=1&&o<=D){F("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=D){F("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=D){F("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=D){F("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=D){F("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=D){F("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){p(l.probe(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){p(l.tempSource(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){p(l.syncTo(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){p(l.pipeType(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){p(s.manifoldType,{state:String(r)}),F("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){p(s.manifoldFlowProbe,{state:String(r)}),F("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){p(s.manifoldReturnProbe,{state:String(r)}),F("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){p(s.motorProfileDefault,{state:String(r)}),F("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){p(s.simplePreheatEnabled,{state:String(r)}),F("Setting updated: "+t+" = "+r);return}if(t==="zone_zigbee_device"&&o>=1){p(l.zigbee(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_ble_mac"&&o>=1){p(l.ble(o),{state:String(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){p(l.exteriorWalls(o),{state:String(r)||"None"}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){p(l.area(o),{value:Number(r)}),F("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){p(l.spacing(o),{value:Number(r)}),F("Setting updated: "+t+" = "+r,o);return}let a={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct};if(a[t]){let n=Number(r);Number.isNaN(n)||(p(a[t],{value:n}),F("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){_e({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!_.enabled[e-1];_e({key:"zone_enabled",value:t?1:0,zone:e})}};var nt="/dashboard";function at(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function N(e){if(Ke(),at())try{return _e(e),Promise.resolve({ok:!0})}finally{Re()}return fetch(nt+"/set",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:(()=>{let t=new URLSearchParams;for(let[r,o]of Object.entries(e))o!=null&&t.append(r,o);return t.toString()})()}).finally(()=>{Re()})}function qe(e,t){return p(l.setpoint(e),{value:t}),N({key:"zone_setpoint",value:t,zone:e})}function st(e,t){return p(l.enabled(e),{state:t?"on":"off",value:t}),N({key:"zone_enabled",value:t?1:0,zone:e})}function Se(e){return p(s.drivers,{state:e?"on":"off",value:e}),N({key:"drivers_enabled",value:e?1:0})}function ce(e,t){return N({key:"command",value:e,zone:t||void 0})}function it(){return ne("Scanning I2C bus..."),F("I2C scan started"),ce("i2c_scan")}var $t={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},Ut={zone_zigbee_device:e=>l.zigbee(e),zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e)},Xt={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},Qt={manifold_type:s.manifoldType,manifold_flow_probe:s.manifoldFlowProbe,manifold_return_probe:s.manifoldReturnProbe,motor_profile_default:s.motorProfileDefault,simple_preheat_enabled:s.simplePreheatEnabled,helios_enabled:s.heliosEnabled},Yt={close_threshold_multiplier:s.closeThresholdMultiplier,close_slope_threshold:s.closeSlopeThreshold,close_slope_current_factor:s.closeSlopeCurrentFactor,open_threshold_multiplier:s.openThresholdMultiplier,open_slope_threshold:s.openSlopeThreshold,open_slope_current_factor:s.openSlopeCurrentFactor,open_ripple_limit_factor:s.openRippleLimitFactor,generic_runtime_limit_seconds:s.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:s.hmipRuntimeLimitSeconds,relearn_after_movements:s.relearnAfterMovements,relearn_after_hours:s.relearnAfterHours,learned_factor_min_samples:s.learnedFactorMinSamples,learned_factor_max_deviation_pct:s.learnedFactorMaxDeviationPct,helios_port:s.heliosPort,helios_poll_interval_s:s.heliosPollIntervalS,helios_stale_after_s:s.heliosStaleAfterS};function J(e,t,r){let o=$t[t];return o&&p(o(e),{state:r}),N({key:t,value:r,zone:e})}function pe(e,t,r){let o=Ut[t];return o&&p(o(e),{state:r}),N({key:t,value:r,zone:e})}function Pe(e,t,r){let o=Number(r),a=Xt[t];return a&&!Number.isNaN(o)&&p(a(e),{value:o}),N({key:t,value:o,zone:e})}function V(e,t){let r=Qt[e];return r&&p(r,{state:t}),N({key:e,value:t})}function U(e,t){let r=Number(t),o=Yt[e];return o&&!Number.isNaN(r)&&p(o,{value:r}),N({key:e,value:r})}function lt(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return p(l.motorTarget(e),{value:o}),F("Motor "+e+" target set to "+o+"%",e),N({key:"motor_target",value:o,zone:e})}function dt(e,t=1e4){return F("Motor "+e+" open for "+t+"ms",e),N({key:"command",value:"open_motor_timed",zone:e})}function ct(e,t=1e4){return F("Motor "+e+" close for "+t+"ms",e),N({key:"command",value:"close_motor_timed",zone:e})}function Ie(e){return F("Motor "+e+" stopped",e),N({key:"command",value:"stop_motor",zone:e})}function He(e){return te("manualMode",!!e),F(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),N({key:"manual_mode",value:e?1:0})}function pt(e){return F("Motor "+e+" fault reset",e),N({key:"command",value:"motor_reset_fault",zone:e})}function ut(e){return F("Motor "+e+" learned factors reset",e),N({key:"command",value:"motor_reset_learned_factors",zone:e})}function mt(e){return F("Motor "+e+" reset and relearn started",e),N({key:"command",value:"motor_reset_and_relearn",zone:e})}function Ze(){at()||fetch(nt+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&ze(e)}).catch(()=>{})}var We=null,ke=null,gt=null;async function Kt(){ke&&ke.abort(),ke=new AbortController;let e=await fetch("/dashboard/state",{cache:"no-store",signal:ke.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function bt(e){if(!(!e||typeof e!="object")&&!Je()){for(let t in e)p(t,e[t]);le(!1)}}function Jt(e){if(e){if(!e.type){bt(e);return}if(e.type==="state"){bt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;F(t),String(t).indexOf("I2C_SCAN:")!==-1&&ne(String(t))}}}function ft(){We||(We=setTimeout(()=>{We=null,Be()},1e3))}function Be(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){rt();return}Kt().then(t=>{oe(!0),Jt(t),Ze(),gt||(gt=setInterval(Ze,300*1e3)),ft()}).catch(()=>{oe(!1),ft()})}var vt=Object.create(null);function w(e,t){if(vt[e])return;vt[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function O(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function ae(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Ee(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function xt(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var eo=`
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
`;w("hv6-header",eo);var to=()=>`
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
`,Vr=y({tag:"hv6-header",render:to,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),a=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function b(){let f=S("section");g.forEach(E=>{E.classList.toggle("active",E.getAttribute("data-section")===f)})}function u(){let f=S("live"),E=S("pendingWrites"),k=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":f?"Live":"Offline";r.textContent=k,o.classList.toggle("on",!!f),a.textContent=E>0?"Saving...":f?"Synced":"Offline";let c=E>0?"saving":f?"synced":"offline";a.className="meta-chip meta-chip-state "+c,n.textContent=Ee(x(s.uptime)),i.textContent=xt(x(s.wifi));let v=S("firmwareVersion")||h(s.firmware);d.textContent=v?"FW "+v:""}g.forEach(f=>{f.addEventListener("click",E=>{E.preventDefault(),Qe(f.getAttribute("data-section"))})}),C("section",b),C("live",u),C("pendingWrites",u),C("firmwareVersion",u),m(s.uptime,u),m(s.wifi,u),m(s.firmware,u),b(),u()}});var oo=`
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
`;w("status-card",oo);var ro=e=>`
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
`,Yr=y({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:ro,methods:{update(e){this.motorDriversOn=T(s.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=T(s.fault)?"FAULT":"OK",this.connOn=S("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);m(s.drivers,o),m(s.fault,o),C("live",o),r.sw.onclick=()=>{Se(!e.motorDriversOn)},o()}});var no=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
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
`;w("connectivity-card",no);var ao=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,nn=y({tag:"connectivity-card",render:ao,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),a=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function i(){r.textContent=h(s.ip)||"---",o.textContent=h(s.ssid)||"---",a.textContent=h(s.mac)||"---",n.textContent=Ee(x(s.uptime))}m(s.ip,i),m(s.ssid,i),m(s.mac,i),m(s.uptime,i),i()}});var so=`
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
  height: 100%;
  box-sizing: border-box;
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
`;w("graph-widgets",so);var io=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function ht(e,t,r,o){if(!e.length)return"";let a=Math.min.apply(null,e),n=Math.max.apply(null,e),i=Math.max(.001,n-a),d=e.length>1?(t-o*2)/(e.length-1):0,g="";for(let b=0;b<e.length;b++){let u=o+d*b,f=r-o-(e[b]-a)/i*(r-o*2);g+=(b?" L ":"M ")+u.toFixed(2)+" "+f.toFixed(2)}return g}function yt(e,t,r,o,a){e.innerHTML="";let n=ht(t,220,56,5);if(n){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",n),d.setAttribute("fill","none"),d.setAttribute("stroke",r),d.setAttribute("stroke-width","2.2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}let i=o&&o.length?ht(o,220,56,5):"";if(i){let d=document.createElementNS("http://www.w3.org/2000/svg","path");d.setAttribute("d",i),d.setAttribute("fill","none"),d.setAttribute("stroke",a),d.setAttribute("stroke-width","2"),d.setAttribute("stroke-linecap","round"),e.appendChild(d)}}var lo="var(--accent)",co="var(--blue)",po="var(--blue)",cn=y({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:io,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),a=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand");function i(){let d=S("historyFlow"),g=S("historyReturn"),b=S("historyDemand"),u=d.length?d[d.length-1]:null,f=g.length?g[g.length-1]:null,E=b.length?b[b.length-1]:null;r&&a&&(r.textContent=u!=null&&f!=null?(u-f).toFixed(1)+" C":"---",yt(a,d,lo,g,co)),o&&n&&(o.textContent=E!=null?Math.round(E)+"%":"---",yt(n,b,po))}C("historyFlow",i),C("historyReturn",i),C("historyDemand",i),i()}});var K={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},wt=24*3600,me=18,Ve=4,ue=54,Ce=20,ge=4,Fe=B*(me+Ve)-Ve+ge+Ce,uo=`
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
`;w("zone-state-timeline",uo);var mo=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function go(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,a=o-wt,n=1e3,i=n-ue;function d(c){let v=(c-a)/wt;return ue+Math.max(0,Math.min(1,v))*i}let g="http://www.w3.org/2000/svg",b=document.createElementNS(g,"svg");b.setAttribute("viewBox","0 0 "+n+" "+Fe),b.classList.add("timeline-svg");let u=document.createElementNS(g,"rect");u.setAttribute("x",ue),u.setAttribute("y",ge),u.setAttribute("width",i),u.setAttribute("height",Fe-ge-Ce),u.setAttribute("fill","rgba(10,24,46,0.55)"),u.setAttribute("rx","4"),b.appendChild(u);let f=[6,12,18,24];for(let c of f){let v=o-c*3600,A=d(v),z=document.createElementNS(g,"line");z.setAttribute("x1",A),z.setAttribute("y1",ge),z.setAttribute("x2",A),z.setAttribute("y2",Fe-Ce),z.setAttribute("stroke","rgba(120,168,255,.12)"),z.setAttribute("stroke-width","1"),b.appendChild(z)}for(let c=0;c<B;c++){let v=ge+c*(me+Ve),A=document.createElementNS(g,"rect");A.setAttribute("x",ue),A.setAttribute("y",v),A.setAttribute("width",i),A.setAttribute("height",me),A.setAttribute("fill",c%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),b.appendChild(A);let z=document.createElementNS(g,"text");z.setAttribute("x",ue-4),z.setAttribute("y",v+me/2+1),z.setAttribute("text-anchor","end"),z.setAttribute("dominant-baseline","middle"),z.setAttribute("fill","rgba(191,211,245,.65)"),z.setAttribute("font-size","9.5"),z.setAttribute("font-family","Montserrat, sans-serif"),z.setAttribute("font-weight","600"),z.textContent="Z"+(c+1),b.appendChild(z);let R=r.filter(P=>P[0]>=a).map(P=>({t:P[0],state:P[c+1]}));if(R.length===0)continue;let H=R[0].t,j=R[0].state,G=(P,Z,$)=>{if($===255)return;let ee=K[$]||K[255];if(ee.color==="transparent")return;let xe=d(P),De=d(Z),Te=Math.max(1,De-xe),W=document.createElementNS(g,"rect");W.setAttribute("x",xe),W.setAttribute("y",v+1),W.setAttribute("width",Te),W.setAttribute("height",me-2),W.setAttribute("fill",ee.color),W.setAttribute("rx","2"),W.setAttribute("opacity","0.88"),b.appendChild(W)};for(let P=1;P<R.length;P++){let Z=R[P];Z.state!==j&&(G(H,Z.t,j),H=Z.t,j=Z.state)}G(H,o,j)}let E=Fe-Ce+14,k=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let c of k){let v=o-c.hoursAgo*3600,A=d(v),z=document.createElementNS(g,"text");z.setAttribute("x",A),z.setAttribute("y",E),z.setAttribute("text-anchor",c.hoursAgo===0?"end":"middle"),z.setAttribute("fill","rgba(191,211,245,.45)"),z.setAttribute("font-size","9"),z.setAttribute("font-family","Montserrat, sans-serif"),z.textContent=c.label,b.appendChild(z)}return b}function bo(e){e.innerHTML="";let t=[{code:5,...K[5]},{code:6,...K[6]},{code:0,...K[0]},{code:1,...K[1]},{code:7,...K[7]},{code:2,...K[2]}];for(let r of t){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(o)}}var fn=y({tag:"zone-state-timeline",render:mo,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");bo(o);function a(){let n=S("zoneStateHistory"),i=(()=>{let g=S&&S("zoneStateHistory");return g&&g.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!n||!n.entries||n.entries.length===0){let g=document.createElement("div");g.className="timeline-empty",g.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(g);return}let d=go(n,i);d&&r.appendChild(d)}C("zoneStateHistory",a),C("zoneNames",a),a()}});var fo=`
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
`;w("zone-grid",fo);var vo=()=>'<div class="zone-grid"></div>',yn=y({tag:"zone-grid",render:vo,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(M("zone-card",{zone:r}))}});var xo=`
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
`;w("zone-card",xo);var ho=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${re(e.zone)}</div>
		<div class="zc-friendly">${Y(e.zone)||"---"}</div>
	</div>
`,Fn=y({tag:"zone-card",state:e=>({zone:e.zone}),render:ho,onMount(e,t){let r=e.zone,o=l.temp(r),a=l.state(r),n=l.enabled(r),i=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),g=t.querySelector(".zc-zone-name"),b=t.querySelector(".zc-friendly");function u(){let f=T(n),E=String(h(a)||"").toUpperCase()||"OFF",k=S("selectedZone")===r,c=Y(r);g.textContent=re(r),b.textContent=c||O(x(o)),i.textContent=f?E:"OFF";let v=f?E:"OFF",A=v==="HEATING"?"#f2c77b":v==="IDLE"?"#79d17e":v==="FAULT"?"#ff7676":"#7D8BA7",z=v==="HEATING"?"#EEA111":v==="IDLE"?"#79d17e":v==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";i.style.color=A,d.style.background=z,d.style.boxShadow=v==="HEATING"?"0 0 5px rgba(238,161,17,.6)":v==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",k),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&E==="HEATING"),t.classList.toggle("zs-idle",f&&E!=="HEATING"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{Ye(r)}),m(o,u),m(a,u),m(n,u),C("selectedZone",u),C("zoneNames",u),u()}});var yo=`
.zone-detail {
  background: linear-gradient(180deg, rgba(20,44,79,.30), rgba(13,31,58,.24));
  border: 1px solid rgba(120,168,255,.30);
  border-radius: 18px;
  padding: 16px 18px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.zone-detail .zd-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.zone-detail .zd-title {
  font-size: .95rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-strong);
}

.zone-detail .zd-badge {
  border-radius: 999px;
  padding: 3px 9px;
  font-size: .62rem;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: .7px;
  background: rgba(125,139,167,.12);
  color: var(--state-disabled);
  border: 1px solid rgba(125,139,167,.22);
  transition: .18s ease;
}

.zone-detail .zd-badge.badge-heating {
  background: rgba(238,161,17,.15);
  color: var(--state-warn);
  border-color: rgba(238,161,17,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(121,209,126,.12);
  color: var(--state-ok);
  border-color: rgba(121,209,126,.24);
}

.zone-detail .zd-badge.badge-disabled {
  background: rgba(125,139,167,.1);
  color: var(--state-disabled);
  border-color: rgba(125,139,167,.22);
}

.zone-detail .zd-badge.badge-fault {
  background: rgba(255,118,118,.16);
  color: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}

/* Body layout */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(120,168,255,.18);
}

.zone-detail .zd-kicker {
  font-size: .62rem;
  text-transform: uppercase;
  letter-spacing: .8px;
  color: var(--text-secondary);
  font-weight: 700;
  margin-bottom: 4px;
}

.zone-detail .zd-setpoint {
  font-family: var(--mono);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--accent);
}

.zone-detail .zd-target-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.zone-detail .zd-btns {
  display: flex;
  gap: 6px;
}

.zone-detail .spb {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: pointer;
  font-size: 1.15rem;
  transition: .18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zone-detail .spb:hover {
  border-color: rgba(238,161,17,.55);
  color: var(--accent);
  background: rgba(238,161,17,.1);
}

.zone-detail .zd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.zone-detail .zd-toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.zone-detail .zd-toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.zone-detail .sw {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
}

.zone-detail .sw::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.zone-detail .sw.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.zone-detail .sw.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.zone-detail .zd-stats {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.zone-detail .zd-stat {
  padding: 2px 0 6px;
  border-bottom: 1px solid rgba(120,168,255,.22);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.zone-detail .zd-stat-label {
  font-size: .62rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .5px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
`;w("zone-detail",yo);var wo=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${re(e.zone)}</div>
      <span class="zd-badge">---</span>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker">Target Temperature</div>
        <div class="zd-target-row">
          <button class="spb btn-dec">\u2212</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc">+</button>
        </div>
      </div>
      <div class="zd-toggle-row"><span class="zd-toggle-label">Zone Enabled</span><div class="sw btn-toggle"></div></div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
    </div>
  </div>
`,On=y({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:wo,methods:{update(e,t){let r=S("selectedZone"),o=String(h(l.state(r))||"").toUpperCase(),a=T(l.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=re(r),t.setpoint.textContent=O(x(l.setpoint(r))),t.temp.textContent=O(x(l.temp(r))),t.ret.textContent=O(x("sensor-manifold_return_temperature")),t.valve.textContent=ae(x(l.valve(r)));let n=t.badge;n.textContent=a?o||"IDLE":"DISABLED";let i=a?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(i?" "+i:""),t.toggleRow.classList.toggle("is-on",a),t.toggle.classList.toggle("on",a)},incSetpoint(){let e=this.zone,t=x(l.setpoint(e))||20;qe(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=x(l.setpoint(e))||20;qe(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=T(l.enabled(e));st(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggleRow:t.querySelector(".zd-toggle-row"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),a=n=>{let i=S("selectedZone");(n===l.temp(i)||n===l.setpoint(i)||n===l.valve(i)||n===l.state(i)||n===l.enabled(i))&&o()};for(let n=1;n<=6;n++)m(l.temp(n),a),m(l.setpoint(n),a),m(l.valve(n),a),m(l.state(n),a),m(l.enabled(n),a);m("sensor-manifold_return_temperature",o),C("selectedZone",o),o()}});var zo=`
.zone-sensor-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
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

.zone-sensor-card .lbl-help {
  margin-top: -2px;
  color: var(--text-faint);
  font-size: .74rem;
  font-style: italic;
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
`;w("zone-sensor-card",zo);var _o=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
    <div class="zone-sensor-card">
      <div class="card-title">Temperature Sensors / Connectivity</div>
      <div class="cfg-row">
        <span class="lbl">Zone Return Temperature Sensor</span>
        <select class="sel zs-probe">${e}</select>
      </div>
      <div class="cfg-row">
        <span class="lbl">Temperature Source</span>
        <select class="sel zs-source"></select>
      </div>
      <div class="cfg-row zs-row-zigbee">
        <span class="lbl">MQTT Device</span>
        <input class="txt zs-zigbee" maxlength="47" placeholder="zone_x_sensor">
      </div>
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE MAC</span>
        <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
        <span class="lbl-help">Mirror target and control state from another zone.</span>
        <select class="sel zs-sync"></select>
      </div>
    </div>
  `};function So(e,t){let r=e.value,o="<option>None</option>";for(let a=1;a<=6;a++)a!==t&&(o+="<option>Zone "+a+"</option>");e.innerHTML=o,e.value=r||"None"}function zt(){let e=String(h(s.deviceVariant)||"").toLowerCase();return e==="mqtt"?"mqtt":e==="ble"?"ble":"local"}function St(e){return e==="mqtt"?"MQTT":e==="ble"?"BLE":"Local Probe"}function ko(e,t){return e==="Local Probe"?"Local Probe":(e==="MQTT"||e==="Zigbee MQTT"||e==="MQTT Sensor"||e==="MQTT Variant")&&t==="mqtt"?"MQTT":(e==="BLE"||e==="BLE Sensor"||e==="BLE Variant")&&t==="ble"?"BLE":"Local Probe"}function _t(e,t){return e==="Local Probe"?"Local Probe":t==="mqtt"?"MQTT":t==="ble"?"BLE":"Local Probe"}function Eo(e,t,r){let o=St(t),a=t==="local"?"<option>Local Probe</option>":"<option>Local Probe</option><option>"+o+"</option>";e.innerHTML!==a&&(e.innerHTML=a),e.value=r}var Wn=y({tag:"zone-sensor-card",render:_o,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),a=t.querySelector(".zs-zigbee"),n=t.querySelector(".zs-ble"),i=t.querySelector(".zs-sync"),d=t.querySelector(".zs-row-zigbee"),g=t.querySelector(".zs-row-ble"),b=new Set,u=0;function f(){return S("selectedZone")}function E(){let c=f();u!==c&&(So(i,c),u=c);let v=h(l.probe(c)),A=zt(),z=String(h(l.tempSource(c))||""),R=ko(z,A),H=h(l.syncTo(c))||"None",j=h(l.zigbee(c))||"",G=h(l.ble(c))||"";v&&(r.value=v),Eo(o,A,R),i.value=H,document.activeElement!==a&&(a.value=j),document.activeElement!==n&&(n.value=G),d.style.display=A==="mqtt"&&R==="MQTT"?"":"none",g.style.display=A==="ble"&&R==="BLE"?"":"none",!b.has(c)&&A!=="local"&&z==="Local Probe"&&(b.add(c),J(c,"zone_temp_source",_t(St(A),A)))}function k(c){let v=f();(c===l.probe(v)||c===l.tempSource(v)||c===l.syncTo(v)||c===l.zigbee(v)||c===l.ble(v)||c===s.deviceVariant)&&E()}r.addEventListener("change",()=>{J(f(),"zone_probe",r.value)}),o.addEventListener("change",()=>{let c=zt();J(f(),"zone_temp_source",_t(o.value,c))}),i.addEventListener("change",()=>{J(f(),"zone_sync_to",i.value)}),a.addEventListener("change",()=>{pe(f(),"zone_zigbee_device",a.value)}),n.addEventListener("change",()=>{pe(f(),"zone_ble_mac",n.value)}),C("selectedZone",E);for(let c=1;c<=6;c++)m(l.probe(c),k),m(l.tempSource(c),k),m(l.syncTo(c),k),m(l.zigbee(c),k),m(l.ble(c),k);m(s.deviceVariant,E),E()}});var Fo=`
.zone-room-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
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
  margin-bottom: 12px;
}

.zone-room-card .cfg-row.two-col {
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
}

.zone-room-card .cfg-row > div:not(.wall-btn-group) {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.zone-room-card .cfg-row.two-col > div {
  margin-bottom: 0;
}

@media (max-width: 480px) {
  .zone-room-card .cfg-row.two-col {
    grid-template-columns: 1fr;
  }
}

.zone-room-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
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

.zone-room-card .wall-lbl-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: .75rem;
  color: var(--text-secondary);
  margin-top: 0;
  margin-bottom: 8px;
}

.zone-room-card .wall-lbl-hint::after {
  content: 'Select all that apply';
  font-style: italic;
}

.zone-room-card .wall-btn-group {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.zone-room-card .wall-btn {
  padding: 8px 4px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  font-size: .79rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .12s ease, color .12s ease, border-color .12s ease, box-shadow .12s ease;
}

.zone-room-card .wall-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(83,168,255,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

@media (max-width: 680px) {
  .zone-room-card .wall-btn-group {
    grid-template-columns: repeat(5, 1fr);
  }
}
`;w("zone-room-card",Fo);var Co=()=>`
  <div class="zone-room-card">
    <div class="card-title">Zone Settings</div>
    <div class="cfg-row"><span class="lbl">Friendly Name</span><input class="txt zr-friendly" maxlength="24" placeholder="e.g. Living Room"></div>
    <div class="cfg-row two-col">
      <div><span class="lbl">Zone Area</span><input class="txt zr-area" type="number" min="1" step="0.1" placeholder="m2"></div>
      <div><span class="lbl">Pipe Spacing C-C</span><input class="txt zr-spacing" type="number" min="50" step="5" placeholder="200"></div>
    </div>
    <div class="cfg-row"><span class="lbl">Pipe Type</span>
      <select class="sel zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select>
    </div>
    <div class="cfg-row">
      <span class="lbl">Exterior Walls</span>
      <div class="wall-lbl-hint"></div>
      <div class="wall-btn-group">
        <button class="wall-btn" data-wall="None">None</button>
        <button class="wall-btn" data-wall="N">N</button>
        <button class="wall-btn" data-wall="S">S</button>
        <button class="wall-btn" data-wall="E">E</button>
        <button class="wall-btn" data-wall="W">W</button>
      </div>
    </div>
  </div>
`,Xn=y({tag:"zone-room-card",render:Co,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),a=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),i=t.querySelectorAll(".wall-btn");function d(){return S("selectedZone")}function g(){let u=d();document.activeElement!==r&&(r.value=Y(u)||""),document.activeElement!==o&&(o.value=x(l.area(u))!=null?String(x(l.area(u))):""),document.activeElement!==a&&(a.value=x(l.spacing(u))!=null?String(x(l.spacing(u))):""),n.value=h(l.pipeType(u))||"Unknown";let f=h(l.exteriorWalls(u))||"None",E=f==="None"?[]:f.split(",").filter(Boolean);i.forEach(k=>{let c=k.dataset.wall;k.classList.toggle("active",c==="None"?E.length===0:E.includes(c))})}function b(u){let f=d();(u===l.area(f)||u===l.spacing(f)||u===l.pipeType(f)||u===l.exteriorWalls(f))&&g()}r.addEventListener("change",()=>{et(d(),r.value)}),o.addEventListener("change",()=>{Pe(d(),"zone_area_m2",o.value)}),a.addEventListener("change",()=>{Pe(d(),"zone_pipe_spacing_mm",a.value||"200")}),n.addEventListener("change",()=>{J(d(),"zone_pipe_type",n.value)}),i.forEach(u=>{u.addEventListener("click",()=>{let f=u.dataset.wall,E=h(l.exteriorWalls(d()))||"None",k=E==="None"?[]:E.split(",").filter(Boolean);if(f==="None")k=[];else{let v=k.indexOf(f);v>=0?k.splice(v,1):k.push(f)}let c=["N","S","E","W"].filter(v=>k.includes(v));pe(d(),"zone_exterior_walls",c.length?c.join(","):"None")})}),C("selectedZone",g),C("zoneNames",g);for(let u=1;u<=6;u++)m(l.area(u),b),m(l.spacing(u),b),m(l.pipeType(u),b),m(l.exteriorWalls(u),b);g()}});var Ao=`
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
`;w("flow-diagram",Ao);var X=6,At=[60,126,192,258,324,390],Me=225,se=36,fe=160,Ae=90,be=se+fe,Q=640,Lo=11,je=6,Ge=24,ve=Q+20,kt=Q+200,Et=Q+360,Ft=Q+420,Lt="#7D8BA7",Mt="#6C7892",Mo="#8FCBFF",No="#BCDFFF",Do="#E4D092",To="#F2B74C",Oo="#8FCBFF",Ro="#D8E7FF",qo="#7D8BA7",Ct="#B7CBF0",$e="#6C7892",Le="#A3B6D9",Po="#8EA4CD",Io="#42A5F5",Ho="#66BB6A",Zo="#EF5350";function Ne(e,t,r){var o=Me+(e-2.5)*Lo,a=At[e],n=Q-be,i=be+n*.33,d=be+n*.67;return"M"+be+" "+(o-t).toFixed(1)+" C"+i+" "+(o-t).toFixed(1)+" "+d+" "+(a-r).toFixed(1)+" "+Q+" "+(a-r).toFixed(1)+" L"+Q+" "+(a+r).toFixed(1)+" C"+d+" "+(a+r).toFixed(1)+" "+i+" "+(o+t).toFixed(1)+" "+be+" "+(o+t).toFixed(1)+"Z"}function Wo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function Bo(e){let t=String(Y(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function Vo(e,t){return t?e==null||Number.isNaN(e)?Mt:e<.15?Mo:e<.4?No:e<.7?Do:To:Lt}function jo(){var e=1160,t=460,r=Me-Ae/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var a=1;a<=X;a++)o.push('<linearGradient id="rg'+a+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+a+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+a+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=X;n++){var i=Ne(n-1,je,Ge);o.push('<path d="'+i+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=X;n++){var d=Ne(n-1,je,Ge);o.push('<path id="fd-path-'+n+'" d="'+d+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+Q+'" y1="36" x2="'+Q+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var g=5,b=se-g;for(o.push('<rect x="0" y="'+r+'" width="'+b+'" height="'+Ae+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+se+'" y="'+r+'" width="'+fe+'" height="'+Ae+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(se+fe/2)+'" y="'+(Me-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(se+fe/2)+'" y="'+(Me+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(se+fe/2)+'" y="'+(r+Ae+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+ve+'" y="34" font-size="11" fill="'+Le+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+kt+'" y="34" font-size="11" fill="'+Le+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+Et+'" y="34" font-size="11" fill="'+Le+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+Ft+'" y="34" font-size="11" fill="'+Le+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=X;n++){var u=At[n-1];o.push('<text id="fd-zn'+n+'" x="'+ve+'" y="'+(u+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),o.push('<text id="fd-zf'+n+'" x="'+ve+'" y="'+(u+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zsp'+n+'" x="'+(ve+82)+'" y="'+(u+18)+'" font-size="11" fill="'+$e+'" font-weight="600" font-family="var(--mono)"></text>'),o.push('<text id="fd-zt'+n+'" x="'+kt+'" y="'+(u+10)+'" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+n+'" x="'+Et+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+n+'" x="'+Ft+'" y="'+(u+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Po+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+X+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var Go=()=>`<div class="flow-wrap">${jo()}</div>`;y({tag:"flow-diagram",render:Go,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(X+1)};for(let a=1;a<=X;a++)r.zones[a]={textTemp:t.querySelector("#fd-zt"+a),textSetpoint:t.querySelector("#fd-zsp"+a),textFlow:t.querySelector("#fd-zv"+a),textRet:t.querySelector("#fd-zr"+a),label:t.querySelector("#fd-zn"+a),friendly:t.querySelector("#fd-zf"+a),path:t.querySelector("#fd-path-"+a)};function o(){let a=x(s.flow),n=x(s.ret),i=r.flowEl,d=r.retEl,g=r.dtEl;if(i.textContent=O(a),d.textContent="RET "+O(n),a!=null&&n!=null){let b=Number(a)-Number(n);g.textContent=b.toFixed(1)+"\xB0C",g.setAttribute("fill",b<3?Io:b>8?Zo:Ho)}else g.textContent="---";for(let b=1;b<=X;b++){let u=x(l.temp(b)),f=x(l.setpoint(b)),E=x(l.valve(b)),k=T(l.enabled(b)),c=String(h(l.tempSource(b))||"Local Probe"),v=Wo(h(l.probe(b))||""),A=v?x(l.probeTemp(v)):null,z=r.zones[b],R=z.textTemp,H=z.textSetpoint,j=z.textFlow,G=z.textRet,P=z.label,Z=z.friendly,$=z.path,ee=E!=null?Math.max(0,Math.min(100,Number(E)))/100:0;P.textContent="ZONE "+b;let xe=Bo(b);Z.textContent=xe||"---",P.setAttribute("fill",k?Ro:qo),Z.setAttribute("fill",k?Ct:$e),H.setAttribute("fill",k?Ct:$e);let De=Z.getComputedTextLength?Z.getComputedTextLength():0;H.setAttribute("x",String(ve+De+8));let Te=O(u),W=f!=null?O(f):null;if(R.textContent=Te,H.textContent=W?"("+W+")":"",j.textContent=ae(E),j.setAttribute("fill",Vo(ee,k)),c!=="Local Probe"&&A!=null&&!Number.isNaN(Number(A))?(G.textContent=O(A),G.setAttribute("fill",k?Oo:Lt)):(G.textContent="---",G.setAttribute("fill",Mt)),!k)$.setAttribute("d",Ne(b-1,1,2)),$.setAttribute("fill","#2A2D38"),$.setAttribute("opacity","0.4");else{let Ot=Math.max(3,ee*Ge),Rt=Math.max(1.5,ee*je);$.setAttribute("d",Ne(b-1,Rt,Ot)),$.setAttribute("fill","url(#rg"+b+")"),$.setAttribute("opacity","1")}}}m(s.flow,o),m(s.ret,o),C("zoneNames",o);for(let a=1;a<=X;a++)m(l.temp(a),o),m(l.setpoint(a),o),m(l.valve(a),o),m(l.enabled(a),o),m(l.probe(a),o),m(l.tempSource(a),o);for(let a=1;a<=8;a++)m(l.probeTemp(a),o);o()}});var $o=`
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
}`;w("diag-i2c",$o);var Uo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,sa=y({tag:"diag-i2c",render:Uo,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=S("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{it()}),C("i2cResult",o),o()}});var Xo=`
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
  background: linear-gradient(180deg, rgba(20,44,79,.30), rgba(13,31,58,.24));
  border: 1px solid rgba(120,168,255,.30);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
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
  gap: 10px;
}
.dz-stat {
  border-radius: 0;
  padding: 2px 0 6px;
  border-bottom: 1px solid rgba(120,168,255,.22);
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
  padding-top: 10px;
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
  gap: 8px 12px;
}
.dz-motor-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed rgba(120,168,255,.24);
  padding: 2px 0 5px;
  font-size: .76rem;
  gap: 4px;
}
.dz-motor-param.preheat-advance {
  grid-column: 1 / -1;
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
`;w("diag-zone",Xo);function Qo(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function Nt(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Dt(e){return e!=null?Number(e).toFixed(0):"---"}function Yo(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var Ko=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
            <div class="dz-motor-param preheat-advance"><span class="dz-motor-param-name">Preheat advance</span><span class="dz-motor-param-val" data-dz-ph="${t}">---</span></div>
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
  `},ma=y({tag:"diag-zone",render:Ko,onMount(e,t){function r(a){let n=String(h(l.state(a))||"").toUpperCase()||"OFF",i=T(l.enabled(a)),d=t.querySelector('[data-dz-state="'+a+'"]');d.textContent=i?n:"OFF",d.className="dz-state-badge"+(i?" "+Qo(n):""),t.querySelector('[data-dz-temp="'+a+'"]').textContent=O(x(l.temp(a))),t.querySelector('[data-dz-valve="'+a+'"]').textContent=ae(x(l.valve(a))),t.querySelector('[data-dz-ret="'+a+'"]').textContent=O(x(s.ret)),t.querySelector('[data-dz-orip="'+a+'"]').textContent=Dt(x(l.motorOpenRipples(a))),t.querySelector('[data-dz-crip="'+a+'"]').textContent=Dt(x(l.motorCloseRipples(a))),t.querySelector('[data-dz-ofac="'+a+'"]').textContent=Nt(x(l.motorOpenFactor(a))),t.querySelector('[data-dz-cfac="'+a+'"]').textContent=Nt(x(l.motorCloseFactor(a))),t.querySelector('[data-dz-ph="'+a+'"]').textContent=Yo(x(l.preheatAdvance(a)));let g=String(h(l.motorLastFault(a))||"").toUpperCase(),b=g&&g!=="NONE"&&g!=="OK",u=t.querySelector('[data-dz-faultrow="'+a+'"]');u.style.display=b?"flex":"none",b&&(t.querySelector('[data-dz-fault="'+a+'"]').textContent=g)}for(let a=1;a<=6;a++){let n=a,i=()=>r(n);m(l.state(n),i),m(l.enabled(n),i),m(l.temp(n),i),m(l.valve(n),i),m(s.ret,i),m(l.motorOpenRipples(n),i),m(l.motorCloseRipples(n),i),m(l.motorOpenFactor(n),i),m(l.motorCloseFactor(n),i),m(l.preheatAdvance(n),i),m(l.motorLastFault(n),i),r(n)}function o(){let a=t.querySelector("[data-preheat-badge]"),n=a.querySelector(".card-title-preheat-dot"),i=a.querySelector("span:last-child"),g=(h(s.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";a.classList.toggle("on",g),a.classList.toggle("off",!g),n.classList.toggle("on",g),n.classList.toggle("off",!g),i.textContent=g?"Preheat: On":"Preheat: Off"}m(s.simplePreheatEnabled,o),o()}});var Jo=`
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
`;w("diag-activity",Jo);var er=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function tr(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var xa=y({tag:"diag-activity",render:er,onMount(e,t){let r=t.querySelector(".diag-log");function o(){tr(r,tt())}C("activityLog",o),o()}});var or=`
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
`;w("diag-manual-badge",or);var rr=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,_a=y({tag:"diag-manual-badge",render:rr,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let a=!!S("manualMode");r&&r.classList.toggle("on",a)}C("manualMode",o),o()}});var nr=`
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
`;w("diag-zone-motor",nr);var ar=e=>{let t=e.zone||S("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},La=y({tag:"diag-zone-motor-card",render:ar,onMount(e,t){let r=Number(e.zone||S("selectedZone")||1),o=!!S("manualMode"),a=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),g=t.querySelector(".motor-open-btn"),b=t.querySelector(".motor-close-btn"),u=t.querySelector(".motor-stop-btn");function f(c){o=!!c,a&&(a.classList.toggle("on",o),a.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[i,d,g,b,u].forEach(v=>{v&&(v.disabled=!o)})}function E(){let c=!o;if(f(c),c){He(!0);for(let v=1;v<=6;v++)Ie(v)}else He(!1)}function k(){let c=x(l.motorTarget(r));d&&c!=null?d.value=Number(c).toFixed(0):d&&(d.value="0")}i==null||i.addEventListener("change",()=>{r=Number(i.value||1),k()}),a==null||a.addEventListener("click",E),a==null||a.addEventListener("keydown",c=>{c.key!==" "&&c.key!=="Enter"||(c.preventDefault(),E())});for(let c=1;c<=6;c++)m(l.motorTarget(c),k);k(),f(o),C("manualMode",()=>{f(!!S("manualMode"))}),d==null||d.addEventListener("change",c=>{if(!o)return;let v=c.target.value;lt(r,v)}),g==null||g.addEventListener("click",()=>{o&&dt(r,1e4)}),b==null||b.addEventListener("click",()=>{o&&ct(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Ie(r)})}});var sr=`
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
`;w("diag-zone-recovery",sr);var ir=e=>{let t=e.zone||S("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Ra=y({tag:"diag-zone-recovery-card",render:ir,onMount(e,t){let r=Number(e.zone||S("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),a=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),a==null||a.addEventListener("click",()=>{pt(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&ut(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&mt(r)})}});var lr=`
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
  margin-bottom: 12px;
}

.settings-manifold-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
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
  gap: 12px;
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
`;w("settings-manifold-card",lr);var dr=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},Va=y({tag:"settings-manifold-card",render:dr,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),a=t.querySelector(".sm-ret");function n(){r.value=h(s.manifoldType)||"NO (Normally Open)",o.value=h(s.manifoldFlowProbe)||"Probe 7",a.value=h(s.manifoldReturnProbe)||"Probe 8";for(let i=1;i<=8;i++){let d=t.querySelector('[data-probe="'+i+'"]'),g=x(l.probeTemp(i));d&&(d.textContent=O(g))}}r.addEventListener("change",()=>V("manifold_type",r.value)),o.addEventListener("change",()=>V("manifold_flow_probe",o.value)),a.addEventListener("change",()=>V("manifold_return_probe",a.value)),m(s.manifoldType,n),m(s.manifoldFlowProbe,n),m(s.manifoldReturnProbe,n);for(let i=1;i<=8;i++)m(l.probeTemp(i),n);n()}});var cr=`
.settings-control-stack {
  display: grid;
  gap: 14px;
}

.settings-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-card .toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-card .toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

/* Match Helios toggle styling for consistency */
.settings-card .ui-toggle {
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}

.settings-card .ui-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-card .btn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.settings-card .btn {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  transition: .18s ease;
}

.settings-card .btn:hover {
  background: var(--control-bg-hover);
  border-color: rgba(120,168,255,.52);
  color: var(--text-strong);
}

.settings-card .btn.warn {
  grid-column: 1 / -1;
  border-color: rgba(255,118,118,.5);
  background: rgba(255,118,118,.2);
  color: #FFD9D9;
}

.settings-card .btn.warn:hover {
  background: rgba(255,100,100,.3);
  border-color: rgba(255,100,100,.6);
}

@media (max-width: 640px) {
  .settings-card .btn-row {
    grid-template-columns: 1fr;
  }

  .settings-card .btn.warn {
    grid-column: 1;
  }
}
`;w("settings-control-card",cr);var pr=()=>`
  <div class="settings-control-stack">
    <div class="settings-card settings-functionality-card">
      <div class="card-title">Functionality</div>
      <div class="toggle-row">
        <span class="toggle-label">Motor Drivers</span>
        <div class="ui-toggle drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div>
      </div>
      <div class="toggle-row">
        <span class="toggle-label">Simple Preheat</span>
        <div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div>
      </div>
    </div>

    <div class="settings-card settings-action-card">
      <div class="card-title">Control</div>
      <div class="btn-row">
        <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
        <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
        <button class="btn warn sc-restart">Restart Device</button>
      </div>
    </div>
  </div>
`,Ya=y({tag:"settings-control-card",render:pr,onMount(e,t){let r=t.querySelector(".drivers-toggle"),o=t.querySelector(".preheat-toggle"),a=r.closest(".toggle-row"),n=o.closest(".toggle-row");function i(){return T(s.drivers)}function d(){let u=i();r.classList.toggle("on",u),a.classList.toggle("is-on",u),r.setAttribute("aria-checked",u?"true":"false")}r.addEventListener("click",()=>{Se(!i())}),m(s.drivers,d),d();function g(){let u=String(h(s.simplePreheatEnabled)||"").toLowerCase();return u==="on"||u==="true"||u==="1"||u==="enabled"}function b(){let u=g();o.classList.toggle("on",u),n.classList.toggle("is-on",u),o.setAttribute("aria-checked",u?"true":"false")}o.addEventListener("click",()=>{let u=!g();V("simple_preheat_enabled",u?"on":"off")}),m(s.simplePreheatEnabled,b),b(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ce("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ce("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ce("restart")})}});var ur=`
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
`;w("settings-motor-calibration-card",ur);var ie=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:s.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:s.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:s.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:s.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:s.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:s.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:s.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:s.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:s.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:s.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:s.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:s.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],mr=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<ie.length;r++){let o=ie[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function gr(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function Tt(e,t){let r=Number(t);return Number.isFinite(r)?gr(e)?String(Math.round(r)):r.toFixed(2):"0"}var ns=y({tag:"settings-motor-calibration-card",render:mr,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function a(i){if(i==="HmIP VdMot"&&U("hmip_runtime_limit_seconds",40),i==="Generic"){let d=Number(x(s.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&U("generic_runtime_limit_seconds",45)}}function n(){let i=h(s.motorProfileDefault)||"HmIP VdMot";r&&(r.value=i),o&&(i==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=Tt("generic_runtime_limit_seconds",x(s.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<ie.length;d++){let g=ie[d],b=t.querySelector(".smc-"+g.cls);b&&g.key!=="generic_runtime_limit_seconds"&&(b.value=Tt(g.key,x(g.id)))}}r&&(r.addEventListener("change",()=>{V("motor_profile_default",r.value),a(r.value)}),m(s.motorProfileDefault,n));for(let i=0;i<ie.length;i++){let d=ie[i],g=t.querySelector(".smc-"+d.cls);g&&(g.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((h(s.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;U("generic_runtime_limit_seconds",g.value);return}U(d.key,g.value)}),m(d.id,n))}m(s.genericRuntimeLimitSeconds,n),m(s.hmipRuntimeLimitSeconds,n),a(h(s.motorProfileDefault)||"HmIP VdMot"),n()}});var br=`
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
  gap: 6px;
  margin-bottom: 12px;
}

.settings-helios-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
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
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-helios-card .row-2col .cfg-row {
  margin-bottom: 0;
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
  width: 48px;
  height: 26px;
  border-radius: 999px;
  background: var(--control-bg-hover);
  position: relative;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: background .2s ease, border-color .2s ease;
  flex-shrink: 0;
}

.settings-helios-card .enable-toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  background: #dbe8ff;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-helios-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-helios-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-helios-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-helios-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

@media (max-width: 980px) {
  .settings-helios-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-helios-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;w("settings-helios-card",br);var fr=()=>`
  <div class="settings-helios-card">
    <div class="card-title">
      <span>Helios Integration</span>
      <span class="helios-status-badge offline">offline</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Integration enabled</span>
      <div class="enable-toggle" role="switch" aria-label="Toggle Helios integration"></div>
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
`,ps=y({tag:"settings-helios-card",render:fr,onMount(e,t){let r=t.querySelector(".helios-status-badge"),o=t.querySelector(".enable-row"),a=t.querySelector(".enable-toggle"),n=t.querySelector(".sh-host"),i=t.querySelector(".sh-port"),d=t.querySelector(".sh-cid"),g=t.querySelector(".sh-cid-note"),b=t.querySelector(".sh-poll"),u=t.querySelector(".sh-stale");function f(){let c=h(s.heliosStatus)||"offline";r.textContent=c,r.className="helios-status-badge "+c}function E(){let c=T(s.heliosEnabled);o.classList.toggle("is-on",c),o.classList.toggle("is-off",!c),a.setAttribute("aria-checked",c?"true":"false")}a.addEventListener("click",()=>{let c=!T(s.heliosEnabled);p(s.heliosEnabled,{state:c?"on":"off"}),V("helios_enabled",c?"on":"off")}),n.addEventListener("blur",()=>{let c=n.value.trim();p(s.heliosHost,{state:c}),N({key:"helios_host",value:c})}),d.addEventListener("blur",()=>{let c=d.value.trim();p(s.heliosControllerId,{state:c}),N({key:"helios_controller_id",value:c})}),i.addEventListener("blur",()=>{let c=parseInt(i.value,10);c>=1&&c<=65535&&(p(s.heliosPort,{value:c}),U("helios_port",c))}),b.addEventListener("blur",()=>{let c=parseInt(b.value,10);c>=5&&c<=3600&&(p(s.heliosPollIntervalS,{value:c}),U("helios_poll_interval_s",c))}),u.addEventListener("blur",()=>{let c=parseInt(u.value,10);c>=10&&c<=86400&&(p(s.heliosStaleAfterS,{value:c}),U("helios_stale_after_s",c))});function k(){let c=h(s.heliosHost),v=h(s.heliosControllerId),A=h(s.heliosDeviceId)||"heatvalve-6",z=x(s.heliosPort),R=x(s.heliosPollIntervalS),H=x(s.heliosStaleAfterS);document.activeElement!==n&&c!=null&&(n.value=c),document.activeElement!==d&&(v!=null&&(d.value=v),d.placeholder=A,g.textContent="Leave blank to use device ID: "+A),document.activeElement!==i&&z!=null&&(i.value=z||8080),document.activeElement!==b&&R!=null&&(b.value=R||30),document.activeElement!==u&&H!=null&&(u.value=H||600)}m(s.heliosStatus,f),m(s.heliosEnabled,E),m(s.heliosHost,k),m(s.heliosControllerId,k),m(s.heliosDeviceId,k),m(s.heliosPort,k),m(s.heliosPollIntervalS,k),m(s.heliosStaleAfterS,k),f(),E(),k()}});var vr=`
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
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-connectivity,
.overview-flow-return,
.overview-demand {
  display: flex;
  flex-direction: column;
}

.overview-connectivity > *,
.overview-flow-return > *,
.overview-demand > * {
  flex: 1;
}

.zone-layout,
.diag-layout,
.settings-layout {
  display: grid;
  gap: 14px;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > * {
  flex: 1;
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

  .zone-detail-slot {
    grid-column: 1;
  }
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
`;w("app-root",vr);var xr=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-connectivity"></div>
          <div class="overview-flow-return"></div>
          <div class="overview-demand"></div>
        </div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-sensor-slot"></div>
          <div class="zone-room-slot"></div>
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
`;y({tag:"app-root",render:xr,onMount(e,t){t.querySelector(".hdr").appendChild(M("hv6-header")),t.querySelector(".overview-flow").appendChild(M("flow-diagram")),t.querySelector(".overview-timeline").appendChild(M("zone-state-timeline")),t.querySelector(".overview-connectivity").appendChild(M("connectivity-card")),t.querySelector(".overview-flow-return").appendChild(M("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(M("graph-widgets",{variant:"demand"})),t.querySelector(".zone-selector").appendChild(M("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(M("zone-detail",{zone:S("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(M("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(M("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(M("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(M("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(M("settings-motor-calibration-card")),t.querySelector(".settings-helios-slot").appendChild(M("settings-helios-card")),t.querySelector(".diag-manual-badge-slot").appendChild(M("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(M("diag-i2c")),r.appendChild(M("diag-activity")),r.appendChild(M("diag-zone"));let o=S("selectedZone")||1;r.appendChild(M("diag-zone-motor-card",{zone:o})),r.appendChild(M("diag-zone-recovery-card",{zone:o}));let a=t.querySelectorAll(".sec");function n(){let i=S("section");a.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===i)})}C("section",n),n()}});function hr(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(M("app-root")),Be()}hr();})();

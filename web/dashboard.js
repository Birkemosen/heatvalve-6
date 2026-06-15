(()=>{var ht={},Le={};function E(e){return ht[e.tag]=e,e}function q(e,t){let r=ht[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let s=r.state(t||{});for(let l in s)o[l]=s[l]}if(r.methods)for(let s in r.methods)o[s]=r.methods[s];let i=document.createElement("div");i.innerHTML=r.render(o);let a=i.firstElementChild;return r.onMount&&r.onMount(o,a),a}function f(e,t){(Le[e]||(Le[e]=[])).push(t)}function j(e){let t=Le[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var ee=6,wo=28,Me=Object.create(null),_o=ko(),D={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:So(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:_o,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},zo=300;function So(){let e=Object.create(null);for(let t=1;t<=ee;t++)e[t]=[];return e}function ko(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<ee;)e.push("");return e.slice(0,ee)}function Eo(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(D.zoneNames))}catch(e){}}function V(e){return"$dashboard:"+e}function Ne(e){return Math.max(1,Math.min(ee,Number(e)||1))}function xt(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function _(e){let t=Me[e];return t?t.v!=null?t.v:t.value!=null?t.value:xt(t.s!=null?t.s:t.state):null}function A(e){let t=Me[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Co(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function I(e){return Co(A(e))}function g(e,t){let r=Me[e];r||(r=Me[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);j(e),e==="text_sensor-firmware_version"&&fe("firmwareVersion",A(e)||"")}function L(e,t){f(V(e),t)}function M(e){return D[e]}function fe(e,t){D[e]=t,j(V(e))}function yt(e){D.section!==e&&(D.section=e,j(V("section")))}function wt(e){let t=Ne(e);D.selectedZone!==t&&(D.selectedZone=t,j(V("selectedZone")))}function be(e){let t=!!e;D.live!==t&&(D.live=t,j(V("live")))}function _t(){D.pendingWrites+=1,j(V("pendingWrites"))}function ot(){D.pendingWrites=Math.max(0,D.pendingWrites-1),D.lastWriteAt=Date.now(),j(V("pendingWrites"))}function zt(){return D.pendingWrites>0?!0:Date.now()-D.lastWriteAt<2e3}function St(e,t){let r=Ne(e)-1;D.zoneNames[r]=String(t||"").trim(),Eo(),j(V("zoneNames"))}function de(e){return D.zoneNames[Ne(e)-1]||""}function re(e){let t=Ne(e),r=de(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ve(e){D.i2cResult=e||"No scan has been run yet.",j(V("i2cResult"))}function N(e,t){let r={time:Ao(),msg:String(e||"")};for(D.activityLog.push(r);D.activityLog.length>60;)D.activityLog.shift();if(t>=1&&t<=ee){let o=D.zoneLog[t];for(o.push(r);o.length>8;)o.shift();j(V("zoneLog:"+t))}j(V("activityLog"))}function kt(e){return e>=1&&e<=ee?D.zoneLog[e]:D.activityLog}function tt(e,t){let r=D[e];if(!Array.isArray(r))return;let o=xt(t);if(o!=null){for(r.push(o);r.length>wo;)r.shift();j(V(e))}}function ze(e){let t=Date.now();if(!e&&t-D.lastHistoryAt<3200)return;D.lastHistoryAt=t;let r=0,o=0;for(let i=1;i<=ee;i++){let a=_("sensor-zone_"+i+"_valve_pct");a!=null&&(r+=a,o+=1)}tt("historyFlow",_("sensor-manifold_flow_temperature")),tt("historyReturn",_("sensor-manifold_return_temperature")),tt("historyDemand",o?r/o:0)}function Ao(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function De(e){D.zoneStateHistory=e||null,j(V("zoneStateHistory"))}function Et(){return D.deviceLogSeq}function Te(e,t){if(Array.isArray(e)&&e.length){for(let r of e)D.deviceLog.push({seq:r[0],level:r[1],tag:r[2],msg:r[3]}),r[0]>D.deviceLogSeq&&(D.deviceLogSeq=r[0]);for(;D.deviceLog.length>zo;)D.deviceLog.shift();j(V("deviceLog"))}typeof t=="number"&&t>D.deviceLogSeq&&(D.deviceLogSeq=t-1)}function Ct(){return D.deviceLog}function At(){D.deviceLog=[],j(V("deviceLog"))}function Oe(e){D.forecastHours=e||null,j(V("forecastHours"))}function Ft(){return D.forecastHours}var p={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h"},n={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c"};var W=6,Fo=8,Lt=null,he=0,Pe=1,Mt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],F={temp:new Float32Array(W),setpoint:new Float32Array(W),valve:new Float32Array(W),enabled:new Uint8Array(W),driversEnabled:1,fault:0,manualMode:0};function Lo(){F.manualMode=0,fe("manualMode",!1);for(let s=0;s<W;s++){F.temp[s]=20.5+s*.4,F.setpoint[s]=21+s%3*.5,F.valve[s]=12+s*8,F.enabled[s]=s===4?0:1;let l=s+1;g(p.temp(l),{value:F.temp[s]}),g(p.setpoint(l),{value:F.setpoint[s]}),g(p.valve(l),{value:F.valve[s]}),g(p.state(l),{state:F.valve[s]>5?"heating":"idle"}),g(p.enabled(l),{value:!!F.enabled[s],state:F.enabled[s]?"on":"off"}),g(p.probe(l),{state:"Probe "+l}),g(p.tempSource(l),{state:l%2?"Local Probe":"BLE"}),g(p.syncTo(l),{state:"None"}),g(p.pipeType(l),{state:"PEX 16mm"}),g(p.area(l),{value:8+l*3.5}),g(p.spacing(l),{value:[150,200,150,100,200,150][s]}),g(p.ble(l),{state:"AA:BB:CC:DD:EE:0"+l}),g(p.exteriorWalls(l),{state:["N","E","S","W","N,E","S,W"][s]}),g(p.windExposure(l),{value:[.5,.5,.5,.5,.7,.7][s]}),g(p.solarGain(l),{value:.3}),g(p.thermalLeadH(l),{value:4}),g(p.preheatAdvance(l),{value:.08+s*.03})}for(let s=1;s<=Fo;s++){let l=s<=W?s:W,m=F.temp[l-1]+(s>W?1:.1*s);g(p.probeTemp(s),{value:m})}g(n.flow,{value:34.1}),g(n.ret,{value:30.4}),g(n.uptime,{value:18*3600+720}),g(n.wifi,{value:-57}),g(n.drivers,{value:!0,state:"on"}),g(n.fault,{value:!1,state:"off"}),g(n.ip,{state:"192.168.1.86"}),g(n.ssid,{state:"MockLab"}),g(n.mac,{state:"D8:3B:DA:12:34:56"}),g(n.firmware,{state:"0.5.x-mock"}),g(n.manifoldFlowProbe,{state:"Probe 7"}),g(n.manifoldReturnProbe,{state:"Probe 8"}),g(n.manifoldType,{state:"NC (Normally Closed)"}),g(n.motorProfileDefault,{state:"HmIP VdMot"}),g(n.closeThresholdMultiplier,{value:1.7}),g(n.closeSlopeThreshold,{value:1}),g(n.closeSlopeCurrentFactor,{value:1.4}),g(n.openThresholdMultiplier,{value:1.7}),g(n.openSlopeThreshold,{value:.8}),g(n.openSlopeCurrentFactor,{value:1.3}),g(n.openRippleLimitFactor,{value:1}),g(n.genericRuntimeLimitSeconds,{value:45}),g(n.hmipRuntimeLimitSeconds,{value:40}),g(n.relearnAfterMovements,{value:2e3}),g(n.relearnAfterHours,{value:168}),g(n.learnedFactorMinSamples,{value:3}),g(n.learnedFactorMaxDeviationPct,{value:12}),g(n.simplePreheatEnabled,{state:"on"}),ze(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],i=[];for(let s=0;s<r;s++){let l=(r-1-s)*e,m=t-l,u=Math.floor(s/12)%24,v=o.map(S=>S[u%S.length]),w=l/3600,y=w>2.5&&w<3.5||w>8.5&&w<9.5?1:0;i.push([m,...v,y])}De({interval_s:e,uptime_s:t,count:r,entries:i});let a=[];for(let s=0;s<48;s++){let l=6-3*Math.sin(s/24*Math.PI)-(s>10&&s<20?2:0),m=4+(s>8&&s<18?9*Math.exp(-Math.pow(s-13,2)/12):0)+Math.sin(s/5),u=(220+s*4)%360;a.push([Number(l.toFixed(1)),Number(Math.max(0,m).toFixed(1)),Math.round(u)])}Oe({base_epoch:t,age_s:480,count:48,hours:a}),Nt(6)}function Nt(e){let t=[];for(let r=0;r<e;r++){let o=Mt[Pe%Mt.length];t.push([Pe,o[0],o[1],o[2]]),Pe++}Te(t,Pe)}function Mo(){he+=1,g(n.uptime,{value:Number(Date.now()/1e3)|0}),g(n.wifi,{value:-55-Math.round((1+Math.sin(he/4))*6)});let e=0,t=0,r=0;for(let s=0;s<W;s++){let l=s+1,m=!!F.enabled[s],u=F.temp[s],v=F.setpoint[s],w=m&&F.driversEnabled&&!F.manualMode&&u<v-.25;F.manualMode?F.valve[s]=Math.max(0,F.valve[s]):!m||!F.driversEnabled?F.valve[s]=Math.max(0,F.valve[s]-6):w?F.valve[s]=Math.min(100,F.valve[s]+7+l%3):F.valve[s]=Math.max(0,F.valve[s]-5);let y=w?.05+F.valve[s]/2200:-.03+F.valve[s]/3200;F.temp[s]=u+y+Math.sin((he+l)/5)*.04,m&&F.valve[s]>0&&(e+=F.valve[s],t+=1,r=Math.max(r,F.valve[s])),g(p.temp(l),{value:F.temp[s]}),g(p.valve(l),{value:Math.round(F.valve[s])});let S=Math.max(0,(F.setpoint[s]-F.temp[s]-.15)*.22);g(p.preheatAdvance(l),{value:Number(S.toFixed(2))}),g(p.state(l),{state:m?w?"heating":"idle":"off"}),g(p.enabled(l),{value:m,state:m?"on":"off"}),g(p.probeTemp(l),{value:F.temp[s]+Math.sin((he+l)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(he/6)*.25,i=o-(t?2.1+e/Math.max(1,t*50):1.1);g(n.flow,{value:Number(o.toFixed(1))}),g(n.ret,{value:Number(i.toFixed(1))}),g(p.probeTemp(7),{value:Number((i-.4).toFixed(1))}),g(p.probeTemp(8),{value:Number((o+.2).toFixed(1))}),ze(!0);let a=M("zoneStateHistory");a&&(a.uptime_s=Number(Date.now()/1e3)|0),he%3===0&&Nt(1)}function Dt(){Lt||(Lo(),be(!0),Lt=setInterval(Mo,1200))}function qe(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=W){let a=Number(r);Number.isNaN(a)||(F.setpoint[o-1]=a,g(p.setpoint(o),{value:a}),N("Zone "+o+" setpoint set to "+a.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=W){let a=r>.5;F.enabled[o-1]=a?1:0,g(p.enabled(o),{value:a,state:a?"on":"off"}),N("Zone "+o+(a?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let a=r>.5;F.driversEnabled=a?1:0,g(n.drivers,{value:a,state:a?"on":"off"}),N(a?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let a=r>.5;F.manualMode=a?1:0,fe("manualMode",a);return}if(t==="motor_target"&&o>=1&&o<=W){let a=Number(r||0);g(p.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(a)))}),N("Motor "+o+" target set to "+a+"%",o);return}if(t==="command"){let a=String(r);if(a==="i2c_scan"){ve(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),N("I2C scan complete");return}if(a==="calibrate_all_motors"||a==="restart"){N("Command executed: "+a);return}if(a==="open_motor_timed"&&o>=1&&o<=W){N("Motor "+o+" open timed",o);return}if(a==="close_motor_timed"&&o>=1&&o<=W){N("Motor "+o+" close timed",o);return}if(a==="stop_motor"&&o>=1&&o<=W){N("Motor "+o+" stopped",o);return}if(a==="motor_reset_fault"&&o>=1&&o<=W){N("Motor "+o+" fault reset",o);return}if(a==="motor_reset_learned_factors"&&o>=1&&o<=W){N("Motor "+o+" learned factors reset",o);return}if(a==="motor_reset_and_relearn"&&o>=1&&o<=W){N("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){g(p.probe(o),{state:String(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){g(p.tempSource(o),{state:String(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){g(p.syncTo(o),{state:String(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){g(p.pipeType(o),{state:String(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){g(n.manifoldType,{state:String(r)}),N("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){g(n.manifoldFlowProbe,{state:String(r)}),N("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){g(n.manifoldReturnProbe,{state:String(r)}),N("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){g(n.motorProfileDefault,{state:String(r)}),N("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){g(n.simplePreheatEnabled,{state:String(r)}),N("Setting updated: "+t+" = "+r);return}if(t==="zone_ble_mac"&&o>=1){g(p.ble(o),{state:String(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){let a=String(r)||"None";g(p.exteriorWalls(o),{state:a});let s=a==="None"?0:a.split(",").filter(Boolean).length,l=[0,.5,.7,.85,1][Math.min(s,4)];g(p.windExposure(o),{value:l}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){g(p.area(o),{value:Number(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){g(p.spacing(o),{value:Number(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_wind_exposure"&&o>=1){g(p.windExposure(o),{value:Number(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_solar_gain"&&o>=1){g(p.solarGain(o),{value:Number(r)}),N("Setting updated: "+t+" = "+r,o);return}if(t==="zone_thermal_lead_h"&&o>=1){g(p.thermalLeadH(o),{value:Number(r)}),N("Setting updated: "+t+" = "+r,o);return}let i={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct};if(i[t]){let a=Number(r);Number.isNaN(a)||(g(i[t],{value:a}),N("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){qe({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!F.enabled[e-1];qe({key:"zone_enabled",value:t?1:0,zone:e})}};var Re="/api/hv6/v1";function He(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function $(e,t,r){if(_t(),He())try{return qe(r),Promise.resolve({ok:!0})}finally{ot()}let o=new URLSearchParams;for(let[s,l]of Object.entries(t||{}))l!=null&&o.append(s,l);let i=o.toString(),a=Re+e+(i?"?"+i:"");return fetch(a,{method:"POST"}).then(s=>(s.ok||console.warn(`API call failed: POST ${e} status=${s.status}`),s)).catch(s=>{throw console.error(`API call error: POST ${e}:`,s),s}).finally(()=>{ot()})}function rt(e,t){return g(p.setpoint(e),{value:t}),$(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function Tt(e,t){return g(p.enabled(e),{state:t?"on":"off",value:t}),$(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function Be(e){return g(n.drivers,{state:e?"on":"off",value:e}),$("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ce(e,t){return $("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function Ot(){return ve("Scanning I2C bus..."),N("I2C scan started"),ce("i2c_scan")}var No={zone_probe:e=>p.probe(e),zone_temp_source:e=>p.tempSource(e),zone_sync_to:e=>p.syncTo(e),zone_pipe_type:e=>p.pipeType(e)},Do={zone_ble_mac:e=>p.ble(e),zone_exterior_walls:e=>p.exteriorWalls(e)},To={zone_area_m2:e=>p.area(e),zone_pipe_spacing_mm:e=>p.spacing(e)},Oo={manifold_type:n.manifoldType,manifold_flow_probe:n.manifoldFlowProbe,manifold_return_probe:n.manifoldReturnProbe,motor_profile_default:n.motorProfileDefault,simple_preheat_enabled:n.simplePreheatEnabled},Po={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct};function xe(e,t,r){let o=No[t];return o&&g(o(e),{state:r}),$("/settings/select",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function Ie(e,t,r){let o=Do[t];return o&&g(o(e),{state:r}),$("/settings/text",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function ye(e,t,r){let o=Number(r),i=To[t];return i&&!Number.isNaN(o)&&g(i(e),{value:o}),$("/settings/number",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function J(e,t){let r=Oo[e];return r&&g(r,{state:t}),$("/settings/select",{key:e,value:t},{key:e,value:t})}function Q(e,t){let r=Number(t),o=Po[e];return o&&!Number.isNaN(r)&&g(o,{value:r}),$("/settings/number",{key:e,value:r},{key:e,value:r})}function Pt(e,t){return $("/settings/text",{key:e,value:t},{key:e,value:t})}function qt(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return g(p.motorTarget(e),{value:o}),N("Motor "+e+" target set to "+o+"%",e),$(`/motors/${e}/target`,{value:o},{key:"motor_target",value:o,zone:e})}function Rt(e,t=1e4){return N("Motor "+e+" open for "+t+"ms",e),$(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function Ht(e,t=1e4){return N("Motor "+e+" close for "+t+"ms",e),$(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function at(e){return N("Motor "+e+" stopped",e),$(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function nt(e){return fe("manualMode",!!e),N(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),$("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function Bt(e){return N("Motor "+e+" fault reset",e),ce("motor_reset_fault",e)}function It(e){return N("Motor "+e+" learned factors reset",e),ce("motor_reset_learned_factors",e)}function Zt(e){return N("Motor "+e+" reset and relearn started",e),ce("motor_reset_and_relearn",e)}function st(){He()||fetch(Re+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&De(e)}).catch(()=>{})}function it(){if(He())return;let e=Et();fetch(Re+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Te(t.lines,t.next_seq)}).catch(()=>{})}function lt(){He()||fetch(Re+"/forecast",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Oe(e)}).catch(()=>{})}var dt=null,Ze=null,Wt=null,jt=null,Vt=null;async function qo(){Ze&&Ze.abort(),Ze=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Ze.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function Gt(e){if(!(!e||typeof e!="object")&&!zt()){for(let t in e)g(t,e[t]);ze(!1)}}function Ro(e){if(e){if(!e.type){Gt(e);return}if(e.type==="state"){Gt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;N(t),String(t).indexOf("I2C_SCAN:")!==-1&&ve(String(t))}}}function $t(){dt||(dt=setTimeout(()=>{dt=null,ct()},1e3))}function ct(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Dt();return}qo().then(t=>{be(!0),Ro(t),st(),Wt||(Wt=setInterval(st,300*1e3)),it(),jt||(jt=setInterval(it,3e3)),lt(),Vt||(Vt=setInterval(lt,300*1e3)),$t()}).catch(()=>{be(!1),$t()})}var Ut=Object.create(null);function z(e,t){if(Ut[e])return;Ut[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}var Ho=`
/* ---- Card panel ---- */
.ui-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px 20px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
}

/* ---- Titles & section headers ---- */
.ui-card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin: 0 0 6px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.ui-section {
  color: var(--text-secondary);
  font-size: .7rem;
  font-weight: 700;
  letter-spacing: 1.6px;
  text-transform: uppercase;
  margin: 16px 0 2px;
}

/* ---- Row: label left, control right, divider below ---- */
.ui-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .9rem;
  font-weight: 600;
  line-height: 1.25;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .72rem;
  font-weight: 500;
  font-style: italic;
  margin-top: 2px;
}

.ui-field {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ---- Controls ---- */
.ui-input {
  width: 96px;
  box-sizing: border-box;
  text-align: right;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.ui-input.wide { width: 180px; text-align: left; font-family: inherit; }

.ui-select {
  min-width: 160px;
  max-width: 240px;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.ui-unit { color: var(--text-faint); font-size: .72rem; font-weight: 600; }

/* ---- Numeric stepper (\u2212 value +) ----
   The value reads as plain text (flat, no input chrome) between the buttons;
   double-clicking it reveals the editable input. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 74px;
  text-align: center;
  border-color: transparent;
  background: transparent;
  color: var(--accent);
  font-weight: 700;
  cursor: default;
  -moz-appearance: textfield;
}
.ui-stepper .ui-input.editing {
  border-color: var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  cursor: text;
}
.ui-stepper .ui-input::-webkit-outer-spin-button,
.ui-stepper .ui-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.ui-step-btn {
  width: 32px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 9px;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .15s ease, border-color .15s ease, color .15s ease;
}
.ui-step-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--control-bg-hover); }
.ui-step-btn:active { transform: translateY(1px); }

/* ---- Unsaved-changes banner (sits under the card title) ---- */
.ui-form-banner {
  display: none;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 0 0 6px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(238,161,17,.12);
  border: 1px solid rgba(238,161,17,.4);
}
.ui-form-banner.show { display: flex; }
.ui-form-banner-msg { color: var(--state-warn); font-size: .76rem; font-weight: 700; }
.ui-form-banner-btns { display: flex; gap: 8px; flex-shrink: 0; }
.ui-form-discard,
.ui-form-apply {
  border-radius: 8px;
  padding: 5px 14px;
  font-size: .76rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid var(--control-border);
  transition: .15s ease;
}
.ui-form-discard { background: transparent; color: var(--text-secondary); }
.ui-form-discard:hover { color: var(--text); border-color: var(--text-secondary); }
.ui-form-apply { background: var(--accent); color: #0f213c; border-color: var(--accent); }
.ui-form-apply:hover { filter: brightness(1.08); }

/* ---- Green pill toggle (canonical) ---- */
.ui-toggle {
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
.ui-toggle::after {
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
.ui-toggle.on { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.ui-toggle.on::after { transform: translateX(22px); background: #0f213c; }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .75rem;
  line-height: 1.4;
  margin-top: 8px;
}
.ui-divider {
  border: 0;
  border-top: 1px dashed var(--panel-border);
  margin: 14px 0 2px;
}

/* ---- Buttons (device actions / recovery) ---- */
.ui-btn-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.ui-btn {
  flex: 1;
  min-width: 120px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 10px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
  font-size: .82rem;
  transition: .18s ease;
}
.ui-btn:hover { background: var(--control-bg-hover); border-color: rgba(120,168,255,.52); }
.ui-btn.warn { border-color: rgba(255,118,118,.5); background: rgba(255,118,118,.2); color: #FFD9D9; }
.ui-btn.warn:hover { background: rgba(255,100,100,.3); border-color: rgba(255,100,100,.6); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;z("ui-kit",Ho);function Bo(e,t){let r=Math.abs(Number(e));return!Number.isFinite(r)||r<1e3?t:Math.pow(10,Math.floor(Math.log10(r))-1)}function Io(e){let t=String(e),r=t.indexOf(".");return r<0?0:t.length-r-1}function X(e,t={}){let r=e.querySelector(t.title||".ui-card-title"),o=document.createElement("div");o.className="ui-form-banner",o.innerHTML='<span class="ui-form-banner-msg">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard">Discard</button><button type="button" class="ui-form-apply">Apply</button></span>',r?r.insertAdjacentElement("afterend",o):e.insertAdjacentElement("afterbegin",o);let i=[],a=()=>o.classList.toggle("show",i.some(c=>c.dirty)),s=(c,d)=>{c.dirty=d,a()};function l(c){return c.markDirty=()=>s(c,!0),i.push(c),c}function m(c,d){let x={dirty:!1,input:c},T=d.baseStep!=null?d.baseStep:parseFloat(c.step)||1,O=Io(T),Z=d.min!=null?d.min:c.min!==""?parseFloat(c.min):-1/0,P=d.max!=null?d.max:c.max!==""?parseFloat(c.max):1/0,C=k=>O>0?Number(k).toFixed(O):String(Math.round(Number(k)));if(!d.nostep){let k=document.createElement("div");k.className="ui-stepper",c.parentNode.insertBefore(k,c);let R=document.createElement("button");R.type="button",R.className="ui-step-btn",R.textContent="\u2212",R.tabIndex=-1,R.setAttribute("aria-label","decrease");let H=document.createElement("button");H.type="button",H.className="ui-step-btn",H.textContent="+",H.tabIndex=-1,H.setAttribute("aria-label","increase"),k.appendChild(R),k.appendChild(c),k.appendChild(H),c.readOnly=!0;let G=U=>{if(c.disabled)return;let B=parseFloat(c.value);Number.isFinite(B)||(B=parseFloat(c.placeholder)),Number.isFinite(B)||(B=0);let le=Math.min(P,Math.max(Z,B+U*Bo(B,T)));c.value=C(le),s(x,!0)};R.addEventListener("click",()=>G(-1)),H.addEventListener("click",()=>G(1)),c.addEventListener("dblclick",()=>{c.disabled||(c.readOnly=!1,c.classList.add("editing"),c.focus(),c.select())}),c.addEventListener("blur",()=>{c.readOnly=!0,c.classList.remove("editing")}),c.addEventListener("keydown",U=>{U.key==="Enter"&&c.blur()})}return c.addEventListener("input",()=>s(x,!0)),x.sync=()=>{let k=d.read();c.value=k!=null&&Number.isFinite(Number(k))?C(k):""},x.commit=()=>{let k=parseFloat(c.value);Number.isFinite(k)&&d.commit(Math.min(P,Math.max(Z,k)))},l(x)}function u(c,d){let x={dirty:!1,input:c};return c.addEventListener("input",()=>s(x,!0)),x.sync=()=>{let T=d.read();c.value=T!=null?T:""},x.commit=()=>d.commit(c.value.trim()),l(x)}function v(c,d){let x={dirty:!1,input:c};return c.addEventListener("change",()=>s(x,!0)),x.sync=()=>{let T=d.read();T!=null&&(c.value=T)},x.commit=()=>d.commit(c.value),l(x)}function w(c,d){let x={dirty:!1,input:c,staged:!1},T=c.closest(".ui-row"),O=()=>{c.classList.toggle("on",x.staged),T&&T.classList.toggle("is-on",x.staged),c.setAttribute("aria-checked",x.staged?"true":"false"),d.onChange&&d.onChange(x.staged)};return c.addEventListener("click",()=>{x.staged=!x.staged,s(x,!0),O()}),x.sync=()=>{x.staged=!!d.read(),O()},x.commit=()=>d.commit(x.staged),l(x)}function y(c){let d={dirty:!1,sync:c.sync,commit:c.commit};return l(d)}let S=()=>i.forEach(c=>{!c.dirty&&c.sync&&c.sync()}),h=()=>{i.forEach(c=>{c.dirty&&(c.commit&&c.commit(),c.dirty=!1)}),a(),t.onApply&&t.onApply()},b=()=>{i.forEach(c=>{c.dirty=!1,c.sync&&c.sync()}),a(),t.onDiscard&&t.onDiscard()};return o.querySelector(".ui-form-apply").addEventListener("click",h),o.querySelector(".ui-form-discard").addEventListener("click",b),{num:m,text:u,select:v,toggle:w,custom:y,refresh:S,apply:h,discard:b,isDirty:()=>i.some(c=>c.dirty)}}function Y(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function We(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function je(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function Xt(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var Zo=`
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
`;z("hv6-header",Zo);var Wo=()=>`
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
        <a href="#" class="menu-link active" data-section="overview">Monitor</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
        <a href="#" class="menu-link" data-section="logs">Logs</a>
      </nav>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
          <span class="meta-chip" id="hdr-asgard" hidden><span class="meta-chip-label">Asgard</span><span class="meta-chip-value" id="hdr-asgard-val">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,dn=E({tag:"hv6-header",render:Wo,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),i=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),s=t.querySelector("#hdr-wifi"),l=t.querySelector("#hdr-asgard"),m=t.querySelector("#hdr-asgard-val"),u=t.querySelector("#hdr-fw"),v=t.querySelectorAll(".menu-link");function w(){let S=M("section");v.forEach(h=>{h.classList.toggle("active",h.getAttribute("data-section")===S)})}function y(){let S=M("live"),h=M("pendingWrites"),b=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":S?"Live":"Offline";r.textContent=b,o.classList.toggle("on",!!S),i.textContent=h>0?"Saving...":S?"Synced":"Offline";let c=h>0?"saving":S?"synced":"offline";i.className="meta-chip meta-chip-state "+c,a.textContent=je(_(n.uptime)),s.textContent=Xt(_(n.wifi));let d=_(n.asgardLastPushC),x=I(n.asgardEnabled)&&d!=null&&Number.isFinite(d);l.hidden=!x,x&&(m.textContent=d.toFixed(2)+"\xB0C");let T=M("firmwareVersion")||A(n.firmware);u.textContent=T?"FW "+T:""}v.forEach(S=>{S.addEventListener("click",h=>{h.preventDefault(),yt(S.getAttribute("data-section"))})}),L("section",w),L("live",y),L("pendingWrites",y),L("firmwareVersion",y),f(n.uptime,y),f(n.wifi,y),f(n.asgardLastPushC,y),f(n.asgardEnabled,y),f(n.firmware,y),w(),y()}});var jo=`
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
`;z("status-card",jo);var Vo=e=>`
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
`,bn=E({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Vo,methods:{update(e){this.motorDriversOn=I(n.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=I(n.fault)?"FAULT":"OK",this.connOn=M("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);f(n.drivers,o),f(n.fault,o),L("live",o),r.sw.onclick=()=>{Be(!e.motorDriversOn)},o()}});var Go=`
.connectivity-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: var(--panel-shadow);
  height: 100%;
  box-sizing: border-box;
}

.connectivity-card .card-title {
  font-size: .72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--accent);
  margin-bottom: 6px;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--panel-border);
}

.connectivity-card .st { width: 100%; border-collapse: collapse; }
.connectivity-card .st td { padding: 5px 0; font-size: .72rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 42%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); font-family: var(--mono); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;z("connectivity-card",Go);var $o=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,zn=E({tag:"connectivity-card",render:$o,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),i=t.querySelector(".cc-mac"),a=t.querySelector(".cc-up");function s(){r.textContent=A(n.ip)||"---",o.textContent=A(n.ssid)||"---",i.textContent=A(n.mac)||"---",a.textContent=je(_(n.uptime))}f(n.ip,s),f(n.ssid,s),f(n.mac,s),f(n.uptime,s),s()}});var pt="http://www.w3.org/2000/svg",Qt=220,ut=132,ae=10,Uo=10,Xo=24,K=34,Se=Qt-K-Uo,me=ut-ae-Xo,Yo=360,Jo=`
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
  display: flex;
  flex-direction: column;
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

.graph-legend {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 8px;
}

.graph-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-faint);
  font-size: .62rem;
  letter-spacing: .5px;
  text-transform: uppercase;
  font-weight: 700;
}

.graph-legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgba(10, 20, 34, .45);
}

.graph-card svg {
  width: 100%;
  height: 132px;
  flex: 1;
  min-height: 132px;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(83,168,255,.12), rgba(15,33,60,.4));
}

.graph-axis,
.graph-grid {
  vector-effect: non-scaling-stroke;
}

.graph-tick-label {
  fill: var(--text-faint);
  font-size: 8px;
  letter-spacing: .4px;
}

.graph-axis-label {
  fill: var(--text-faint);
  font-size: 6px;
  letter-spacing: .8px;
  text-transform: uppercase;
  opacity: .7;
}
`;z("graph-widgets",Jo);var Qo=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function Yt(e,t,r){if(!e.length)return"";let o=Math.max(.001,r-t),i=e.length>1?Se/(e.length-1):0,a="";for(let s=0;s<e.length;s++){let l=K+i*s,m=ae+(1-(e[s]-t)/o)*me;a+=(s?" L ":"M ")+l.toFixed(2)+" "+m.toFixed(2)}return a}function we(e,t,r){let o=document.createElementNS(pt,e);return t&&Object.keys(t).forEach(i=>{o.setAttribute(i,t[i])}),r!=null&&(o.textContent=r),o}function Ko(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"C":"---"}function er(e){return e<=0?"now":e>=60?"-"+Math.round(e/60)+"h":"-"+Math.round(e)+"m"}function tr(e,t,r,o){let i="rgba(143, 176, 230, 0.42)",a="rgba(143, 176, 230, 0.16)",l=[{x:K,ratio:0},{x:K+Se/2,ratio:.5},{x:K+Se,ratio:1}];e.appendChild(we("line",{x1:K,y1:ae,x2:K,y2:ae+me,stroke:i,"stroke-width":"1",class:"graph-axis"})),e.appendChild(we("line",{x1:K,y1:ae+me,x2:K+Se,y2:ae+me,stroke:i,"stroke-width":"1",class:"graph-axis"}));for(let m=0;m<3;m++){let u=m/2,v=ae+u*me,w=r-(r-t)*u;e.appendChild(we("line",{x1:K,y1:v,x2:K+Se,y2:v,stroke:a,"stroke-width":"1",class:"graph-grid"})),e.appendChild(we("text",{x:K-5,y:v+3,"text-anchor":"end",class:"graph-tick-label"},Ko(w,o)))}l.forEach(m=>{let u=Yo*(1-m.ratio);e.appendChild(we("text",{x:m.x,y:ut-6,"text-anchor":m.ratio===0?"start":m.ratio===1?"end":"middle",class:"graph-tick-label"},er(u)))}),e.appendChild(we("text",{x:5,y:ae+me/2,transform:"rotate(-90 5 "+(ae+me/2).toFixed(2)+")","text-anchor":"middle",class:"graph-axis-label"},o==="%"?"Demand":"Temp"))}function or(e,t,r){let o=e.concat(t||[]).filter(l=>Number.isFinite(l));if(!o.length)return r==="%"?{min:0,max:100}:{min:0,max:10};let i=Math.min.apply(null,o),a=Math.max.apply(null,o);if(r==="%"&&(i=Math.max(0,i),a=Math.min(100,a)),i===a){let l=r==="%"?5:.5;i-=l,a+=l}let s=(a-i)*.08;return i-=s,a+=s,r==="%"&&(i=Math.max(0,i),a=Math.min(100,a)),{min:i,max:a}}function Jt(e,t,r,o,i,a){e.innerHTML="",e.setAttribute("viewBox","0 0 "+Qt+" "+ut),e.setAttribute("preserveAspectRatio","none");let s=or(t,o,a);tr(e,s.min,s.max,a);let l=Yt(t,s.min,s.max);if(l){let u=document.createElementNS(pt,"path");u.setAttribute("d",l),u.setAttribute("fill","none"),u.setAttribute("stroke",r),u.setAttribute("stroke-width","2.2"),u.setAttribute("stroke-linecap","round"),u.setAttribute("stroke-linejoin","round"),e.appendChild(u)}let m=o&&o.length?Yt(o,s.min,s.max):"";if(m){let u=document.createElementNS(pt,"path");u.setAttribute("d",m),u.setAttribute("fill","none"),u.setAttribute("stroke",i),u.setAttribute("stroke-width","2"),u.setAttribute("stroke-linecap","round"),u.setAttribute("stroke-linejoin","round"),e.appendChild(u)}}var rr="var(--accent)",ar="var(--blue)",nr="var(--blue)",An=E({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:Qo,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),i=t.querySelector(".gw-flow"),a=t.querySelector(".gw-demand");function s(){let l=M("historyFlow"),m=M("historyReturn"),u=M("historyDemand"),v=l.length?l[l.length-1]:null,w=m.length?m[m.length-1]:null,y=u.length?u[u.length-1]:null;r&&i&&(r.textContent=v!=null&&w!=null?(v-w).toFixed(1)+" C":"---",Jt(i,l,rr,m,ar,"C")),o&&a&&(o.textContent=y!=null?Math.round(y)+"%":"---",Jt(a,u,nr,null,null,"%"))}L("historyFlow",s),L("historyReturn",s),L("historyDemand",s),s()}});var pe={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},Kt=24*3600,ke=18,gt=4,ge=54,Ge=20,Ee=4,$e=10,to=6,oo="#b07bd1",eo=ee+1,ro=Ee+ee*(ke+gt)-gt,mt=ro+to,Ve=ro+to+$e+Ge,sr=`
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
`;z("zone-state-timeline",sr);var ir=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function lr(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,i=o-Kt,a=1e3,s=a-ge;function l(h){let b=(h-i)/Kt;return ge+Math.max(0,Math.min(1,b))*s}let m="http://www.w3.org/2000/svg",u=document.createElementNS(m,"svg");u.setAttribute("viewBox","0 0 "+a+" "+Ve),u.classList.add("timeline-svg");let v=document.createElementNS(m,"rect");v.setAttribute("x",ge),v.setAttribute("y",Ee),v.setAttribute("width",s),v.setAttribute("height",Ve-Ee-Ge),v.setAttribute("fill","rgba(10,24,46,0.55)"),v.setAttribute("rx","4"),u.appendChild(v);let w=[6,12,18,24];for(let h of w){let b=o-h*3600,c=l(b),d=document.createElementNS(m,"line");d.setAttribute("x1",c),d.setAttribute("y1",Ee),d.setAttribute("x2",c),d.setAttribute("y2",Ve-Ge),d.setAttribute("stroke","rgba(120,168,255,.12)"),d.setAttribute("stroke-width","1"),u.appendChild(d)}for(let h=0;h<ee;h++){let b=Ee+h*(ke+gt),c=document.createElementNS(m,"rect");c.setAttribute("x",ge),c.setAttribute("y",b),c.setAttribute("width",s),c.setAttribute("height",ke),c.setAttribute("fill",h%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),u.appendChild(c);let d=document.createElementNS(m,"text");d.setAttribute("x",ge-4),d.setAttribute("y",b+ke/2+1),d.setAttribute("text-anchor","end"),d.setAttribute("dominant-baseline","middle"),d.setAttribute("fill","rgba(191,211,245,.65)"),d.setAttribute("font-size","9.5"),d.setAttribute("font-family","Montserrat, sans-serif"),d.setAttribute("font-weight","600"),d.textContent="Z"+(h+1),u.appendChild(d);let x=r.filter(P=>P[0]>=i).map(P=>({t:P[0],state:P[h+1]}));if(x.length===0)continue;let T=x[0].t,O=x[0].state,Z=(P,C,k)=>{if(k===255)return;let R=pe[k]||pe[255];if(R.color==="transparent")return;let H=l(P),G=l(C),U=Math.max(1,G-H),B=document.createElementNS(m,"rect");B.setAttribute("x",H),B.setAttribute("y",b+1),B.setAttribute("width",U),B.setAttribute("height",ke-2),B.setAttribute("fill",R.color),B.setAttribute("rx","2"),B.setAttribute("opacity","0.88"),u.appendChild(B)};for(let P=1;P<x.length;P++){let C=x[P];C.state!==O&&(Z(T,C.t,O),T=C.t,O=C.state)}Z(T,o,O)}{let h=document.createElementNS(m,"rect");h.setAttribute("x",ge),h.setAttribute("y",mt),h.setAttribute("width",s),h.setAttribute("height",$e),h.setAttribute("fill","rgba(176,123,209,0.08)"),h.setAttribute("rx","2"),u.appendChild(h);let b=document.createElementNS(m,"text");b.setAttribute("x",ge-4),b.setAttribute("y",mt+$e/2+1),b.setAttribute("text-anchor","end"),b.setAttribute("dominant-baseline","middle"),b.setAttribute("fill","rgba(191,211,245,.65)"),b.setAttribute("font-size","8.5"),b.setAttribute("font-family","Montserrat, sans-serif"),b.setAttribute("font-weight","600"),b.textContent="Absorb",u.appendChild(b);let c=r.filter(d=>d[0]>=i).map(d=>({t:d[0],on:d.length>eo?d[eo]:0}));if(c.length){let d=(O,Z)=>{let P=l(O),C=Math.max(1,l(Z)-P),k=document.createElementNS(m,"rect");k.setAttribute("x",P),k.setAttribute("y",mt),k.setAttribute("width",C),k.setAttribute("height",$e),k.setAttribute("fill",oo),k.setAttribute("rx","2"),k.setAttribute("opacity","0.9"),u.appendChild(k)},x=c[0].t,T=c[0].on;for(let O=1;O<c.length;O++)c[O].on!==T&&(T&&d(x,c[O].t),x=c[O].t,T=c[O].on);T&&d(x,o)}}let y=Ve-Ge+14,S=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let h of S){let b=o-h.hoursAgo*3600,c=l(b),d=document.createElementNS(m,"text");d.setAttribute("x",c),d.setAttribute("y",y),d.setAttribute("text-anchor",h.hoursAgo===0?"end":"middle"),d.setAttribute("fill","rgba(191,211,245,.45)"),d.setAttribute("font-size","9"),d.setAttribute("font-family","Montserrat, sans-serif"),d.textContent=h.label,u.appendChild(d)}return u}function dr(e){e.innerHTML="";let t=[{code:5,...pe[5]},{code:6,...pe[6]},{code:0,...pe[0]},{code:1,...pe[1]},{code:7,...pe[7]},{code:2,...pe[2]}];for(let o of t){let i=document.createElement("div");i.className="tl-legend-item",i.innerHTML='<span class="tl-legend-dot" style="background:'+o.color+'"></span>'+o.label,e.appendChild(i)}let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot" style="background:'+oo+'"></span>Preheat absorption',e.appendChild(r)}var Tn=E({tag:"zone-state-timeline",render:ir,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");dr(o);function i(){let a=M("zoneStateHistory"),s=(()=>{let m=M&&M("zoneStateHistory");return m&&m.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!a||!a.entries||a.entries.length===0){let m=document.createElement("div");m.className="timeline-empty",m.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(m);return}let l=lr(a,s);l&&r.appendChild(l)}L("zoneStateHistory",i),L("zoneNames",i),i()}});var cr=`
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
`;z("zone-grid",cr);var pr=()=>'<div class="zone-grid"></div>',Rn=E({tag:"zone-grid",render:pr,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(q("zone-card",{zone:r}))}});var ur=`
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
`;z("zone-card",ur);var mr=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${re(e.zone)}</div>
		<div class="zc-friendly">${de(e.zone)||"---"}</div>
	</div>
`,Vn=E({tag:"zone-card",state:e=>({zone:e.zone}),render:mr,onMount(e,t){let r=e.zone,o=p.temp(r),i=p.state(r),a=p.enabled(r),s=t.querySelector(".zc-state-label"),l=t.querySelector(".zc-dot"),m=t.querySelector(".zc-zone-name"),u=t.querySelector(".zc-friendly");function v(){let w=I(a),y=String(A(i)||"").toUpperCase()||"OFF",S=M("selectedZone")===r,h=de(r);m.textContent=re(r),u.textContent=h||Y(_(o)),s.textContent=w?y:"OFF";let b=w?y:"OFF",c=b==="HEATING"?"#f2c77b":b==="IDLE"?"#79d17e":b==="FAULT"?"#ff7676":"#7D8BA7",d=b==="HEATING"?"#EEA111":b==="IDLE"?"#79d17e":b==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";s.style.color=c,l.style.background=d,l.style.boxShadow=b==="HEATING"?"0 0 5px rgba(238,161,17,.6)":b==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",S),t.classList.toggle("disabled",!w),t.classList.toggle("zs-heating",w&&y==="HEATING"),t.classList.toggle("zs-idle",w&&y!=="HEATING"),t.classList.toggle("zs-off",!w)}t.addEventListener("click",()=>{wt(r)}),f(o,v),f(i,v),f(a,v),L("selectedZone",v),L("zoneNames",v),v()}});var gr=`
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

/* Toggle uses the canonical .ui-toggle from the shared ui-kit. */

/* Temperatures on a single row: small uppercase label above a large value. */
.zone-detail .zd-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 28px;
}

.zone-detail .zd-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.zone-detail .zd-stat-label {
  font-size: .64rem;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.zone-detail .zd-stat-value {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}

.zone-detail .zd-motor {
  border-top: 1px solid var(--panel-border);
  padding-top: 12px;
  margin-top: 2px;
}
.zone-detail .zd-motor-title {
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .7px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.zone-detail .zd-motor .zd-stats { margin-top: 2px; }
.zone-detail .zd-fault {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  margin-top: 8px;
  padding: 5px 8px;
  border-radius: 7px;
  background: rgba(255,118,118,.1);
  border: 1px solid rgba(255,100,100,.25);
  font-size: .76rem;
}
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }
`;z("zone-detail",gr);var fr=e=>`
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
      <div class="zd-toggle-row"><span class="zd-toggle-label">Zone Enabled</span><div class="ui-toggle btn-toggle"></div></div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <div class="zd-motor">
        <div class="zd-motor-title">Motor learned parameters</div>
        <div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div>
        <div class="zd-fault" hidden><span class="zd-fault-label">Last fault</span><span class="zd-fault-val">NONE</span></div>
      </div>
    </div>
  </div>
`;function ao(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function no(e){return e!=null?Number(e).toFixed(0):"---"}function br(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var Kn=E({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:fr,methods:{update(e,t){let r=M("selectedZone"),o=String(A(p.state(r))||"").toUpperCase(),i=I(p.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=re(r),t.setpoint.textContent=Y(_(p.setpoint(r))),t.temp.textContent=Y(_(p.temp(r))),t.ret.textContent=Y(_("sensor-manifold_return_temperature")),t.valve.textContent=We(_(p.valve(r)));let a=t.badge;a.textContent=i?o||"IDLE":"DISABLED";let s=i?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";a.className="zd-badge"+(s?" "+s:""),t.toggleRow.classList.toggle("is-on",i),t.toggle.classList.toggle("on",i),t.orip.textContent=no(_(p.motorOpenRipples(r))),t.crip.textContent=no(_(p.motorCloseRipples(r))),t.ofac.textContent=ao(_(p.motorOpenFactor(r))),t.cfac.textContent=ao(_(p.motorCloseFactor(r))),t.ph.textContent=br(_(p.preheatAdvance(r)));let l=String(A(p.motorLastFault(r))||"").toUpperCase(),m=l&&l!=="NONE"&&l!=="OK";t.fault.hidden=!m,m&&(t.faultVal.textContent=l)},incSetpoint(){let e=this.zone,t=_(p.setpoint(e))||20;rt(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=_(p.setpoint(e))||20;rt(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=I(p.enabled(e));Tt(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggleRow:t.querySelector(".zd-toggle-row"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),i=a=>{let s=M("selectedZone");(a===p.temp(s)||a===p.setpoint(s)||a===p.valve(s)||a===p.state(s)||a===p.enabled(s))&&o()};for(let a=1;a<=6;a++)f(p.temp(a),i),f(p.setpoint(a),i),f(p.valve(a),i),f(p.state(a),i),f(p.enabled(a),i),f(p.motorOpenRipples(a),o),f(p.motorCloseRipples(a),o),f(p.motorOpenFactor(a),o),f(p.motorCloseFactor(a),o),f(p.preheatAdvance(a),o),f(p.motorLastFault(a),o);f("sensor-manifold_return_temperature",o),L("selectedZone",o),o()}});var vr=`
.zone-sensor-card { height: 100%; }

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.zone-sensor-card .ble-row .ble-input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 9px 10px;
  font-size: .88rem;
  font-family: var(--mono);
  transition: border-color .15s ease;
}
.zone-sensor-card .ble-row .ble-input:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}
.zone-sensor-card .btn-scan {
  flex-shrink: 0;
  padding: 9px 13px;
  border-radius: 10px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: .82rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-scan:disabled {
  opacity: .5;
  cursor: default;
}
.zone-sensor-card .ble-scan-list {
  margin-top: 6px;
  border: 1px solid var(--panel-border);
  border-radius: 10px;
  overflow: hidden;
}
.zone-sensor-card .ble-scan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  font-size: .82rem;
  gap: 8px;
  border-bottom: 1px solid var(--panel-border);
}
.zone-sensor-card .ble-scan-item:last-child { border-bottom: none; }
.zone-sensor-card .ble-scan-item .ble-mac {
  font-family: monospace;
  color: var(--text);
  font-size: .8rem;
}
.zone-sensor-card .ble-scan-item .ble-meta {
  color: var(--text-secondary);
  font-size: .75rem;
}
.zone-sensor-card .ble-scan-item .ble-badge {
  color: var(--text-faint);
  font-size: .72rem;
  font-style: italic;
}
.zone-sensor-card .btn-assign {
  padding: 5px 11px;
  border-radius: 8px;
  border: 1px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: .78rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.zone-sensor-card .btn-assign:hover {
  background: rgba(83,168,255,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
`;z("zone-sensor-card",vr);var hr=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Temperature Source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section">BLE Sensor</div>
        <div class="ui-note">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="ui-divider"></div>
      <div class="ui-row">
        <span class="ui-label">Sync To Zone <span class="ui-sublabel">mirror target &amp; control from another zone</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
    </div>
  `};function xr(e,t){let r=e.value,o="<option>None</option>";for(let i=1;i<=6;i++)i!==t&&(o+="<option>Zone "+i+"</option>");e.innerHTML=o,e.value=r||"None"}function yr(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function wr(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function _r(e,t){let r="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==r&&(e.innerHTML=r),e.value=t}var is=E({tag:"zone-sensor-card",render:hr,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),i=t.querySelector(".zs-ble"),a=t.querySelector(".zs-sync"),s=t.querySelector(".zs-row-ble"),l=t.querySelector(".zs-scan"),m=t.querySelector(".zs-scan-list"),u=0;function v(){return M("selectedZone")}function w(){s.style.display=o.value==="BLE Sensor"?"":"none"}let y=X(t);_r(o,"Local Probe"),y.select(r,{read:()=>A(p.probe(v()))||void 0,commit:c=>xe(v(),"zone_probe",c)}),y.select(o,{read:()=>yr(String(A(p.tempSource(v()))||"")),commit:c=>xe(v(),"zone_temp_source",wr(c))}),y.select(a,{read:()=>A(p.syncTo(v()))||"None",commit:c=>xe(v(),"zone_sync_to",c)});let S=y.text(i,{read:()=>A(p.ble(v()))||"",commit:c=>Ie(v(),"zone_ble_mac",c)});o.addEventListener("change",w);function h(){let c=v();u!==c?(xr(a,c),u=c,m.style.display="none",y.discard()):y.refresh(),w()}function b(c){let d=v();(c===p.probe(d)||c===p.tempSource(d)||c===p.syncTo(d)||c===p.ble(d))&&(y.refresh(),w())}l.addEventListener("click",()=>{if(l.disabled)return;l.disabled=!0,l.textContent="\u2026",m.style.display="",m.innerHTML='<div class="scan-msg">Scanning\u2026</div>';let c=new AbortController,d=setTimeout(()=>c.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:c.signal}).then(x=>{if(!x.ok)throw new Error("HTTP "+x.status);return x.json()}).then(x=>{if(clearTimeout(d),l.disabled=!1,l.textContent="Scan",!x.ok||!x.sensors||x.sensors.length===0){m.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let T=v(),O=(A(p.ble(T))||"").toUpperCase(),Z=C=>String(C).replace(/[&<>"']/g,k=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[k]),P="";for(let C of x.sensors){let k=C.mac.toUpperCase(),R=C.name?Z(C.name):"",H=C.temp_c!=null?C.temp_c.toFixed(1)+"\xB0C":"\u2014",G=C.rssi!=null?C.rssi+" dBm":"",U=C.age_s<60?C.age_s+"s ago":Math.round(C.age_s/60)+"m ago",B="";k===O?B='<span class="ble-badge">assigned to this zone</span>':C.zone>0&&(B='<span class="ble-badge">zone '+C.zone+"</span>");let le=R?`<div class="ble-mac">${R}</div><div class="ble-meta">${k}</div>`:`<div class="ble-mac">${k}</div>`;P+=`<div class="ble-scan-item">
              <div>
                ${le}
                <div class="ble-meta">${H} &nbsp;${G} &nbsp;${U}</div>
                ${B}
              </div>
              <button class="btn-assign" data-mac="${k}">Assign</button>
            </div>`}m.innerHTML=P,m.querySelectorAll(".btn-assign").forEach(C=>{C.addEventListener("click",()=>{i.value=C.dataset.mac,S.markDirty(),m.style.display="none"})})}).catch(x=>{clearTimeout(d),l.disabled=!1,l.textContent="Scan";let T=x&&x.name==="AbortError"?"Scan timed out \u2014 device busy or BLE not responding. Try again.":"Scan failed. Check device connectivity.";m.innerHTML='<div class="scan-msg">'+T+"</div>"})}),L("selectedZone",h);for(let c=1;c<=6;c++)f(p.probe(c),b),f(p.tempSource(c),b),f(p.syncTo(c),b),f(p.ble(c),b);h()}});var zr=[0,.5,.7,.85,1];function Sr(e){return zr[Math.min(e,4)]}var kr=`
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
}
.zone-room-card .wall-lbl-hint::after { content: 'Select all that apply'; }

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
`;z("zone-room-card",kr);var Er=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Zone Area (m\xB2)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section">Exterior Walls</div>
    <div class="wall-lbl-hint"></div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>

    <div class="ui-divider"></div>
    <div class="ui-section">Forecast Preload</div>
    <div class="ui-row">
      <span class="ui-label">Wind Exposure</span>
      <span class="ui-field"><input class="ui-input zr-wind" type="number" min="0" max="1" step="0.05" placeholder="0.5"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Solar Gain</span>
      <span class="ui-field"><input class="ui-input zr-solar" type="number" min="0" max="1" step="0.05" placeholder="0.3"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label">Thermal Lead (h)</span>
      <span class="ui-field"><input class="ui-input zr-lead" type="number" min="0" max="48" step="1" placeholder="4"></span>
    </div>
    <div class="ui-note">Wind exposure (0\u20131) is auto-seeded from the exterior walls above \u2014 edit it for a sheltered or extra-exposed site. Solar (0\u20131) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.</div>
  </div>
`,fs=E({tag:"zone-room-card",render:Er,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),i=t.querySelector(".zr-spacing"),a=t.querySelector(".zr-pipe"),s=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),l=t.querySelector(".zr-wind"),m=t.querySelector(".zr-solar"),u=t.querySelector(".zr-lead");function v(){return M("selectedZone")}let w=X(t);w.text(r,{read:()=>de(v())||"",commit:d=>St(v(),d)}),w.num(o,{read:()=>_(p.area(v())),commit:d=>ye(v(),"zone_area_m2",d)}),w.num(i,{read:()=>_(p.spacing(v())),commit:d=>ye(v(),"zone_pipe_spacing_mm",d||200)}),w.select(a,{read:()=>A(p.pipeType(v()))||"Unknown",commit:d=>xe(v(),"zone_pipe_type",d)});let y=w.num(l,{read:()=>_(p.windExposure(v())),commit:d=>ye(v(),"zone_wind_exposure",d)});w.num(m,{read:()=>_(p.solarGain(v())),commit:d=>ye(v(),"zone_solar_gain",d)}),w.num(u,{read:()=>_(p.thermalLeadH(v())),commit:d=>ye(v(),"zone_thermal_lead_h",d)});let S=[];function h(){s.forEach(d=>{let x=d.dataset.wall;d.classList.toggle("active",x==="None"?S.length===0:S.includes(x))})}let b=w.custom({sync:()=>{let d=A(p.exteriorWalls(v()))||"None";S=d==="None"?[]:d.split(",").filter(Boolean),h()},commit:()=>Ie(v(),"zone_exterior_walls",S.length?S.join(","):"None")});s.forEach(d=>{d.addEventListener("click",()=>{let x=d.dataset.wall,T=S.slice();if(x==="None")T=[];else{let O=T.indexOf(x);O>=0?T.splice(O,1):T.push(x)}S=["N","S","E","W"].filter(O=>T.includes(O)),h(),b.markDirty(),l.value=String(Sr(S.length)),y.markDirty()})});function c(d){let x=v();(d===p.area(x)||d===p.spacing(x)||d===p.pipeType(x)||d===p.exteriorWalls(x)||d===p.windExposure(x)||d===p.solarGain(x)||d===p.thermalLeadH(x))&&w.refresh()}L("selectedZone",w.discard),L("zoneNames",w.refresh);for(let d=1;d<=6;d++)f(p.area(d),c),f(p.spacing(d),c),f(p.pipeType(d),c),f(p.exteriorWalls(d),c),f(p.windExposure(d),c),f(p.solarGain(d),c),f(p.thermalLeadH(d),c);w.refresh()}});var Cr=`
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
`;z("flow-diagram",Cr);var ne=6,po=[60,126,192,258,324,390],Ye=225,_e=36,Ae=160,Ue=90,Ce=_e+Ae,se=640,Ar=11,ft=6,bt=24,Fe=se+20,so=se+200,io=se+360,lo=se+420,uo="#7D8BA7",mo="#6C7892",Fr="#8FCBFF",Lr="#BCDFFF",Mr="#E4D092",Nr="#F2B74C",Dr="#8FCBFF",Tr="#D8E7FF",Or="#7D8BA7",co="#B7CBF0",vt="#6C7892",Xe="#A3B6D9",Pr="#8EA4CD",qr="#42A5F5",Rr="#66BB6A",Hr="#EF5350";function Je(e,t,r){var o=Ye+(e-2.5)*Ar,i=po[e],a=se-Ce,s=Ce+a*.33,l=Ce+a*.67;return"M"+Ce+" "+(o-t).toFixed(1)+" C"+s+" "+(o-t).toFixed(1)+" "+l+" "+(i-r).toFixed(1)+" "+se+" "+(i-r).toFixed(1)+" L"+se+" "+(i+r).toFixed(1)+" C"+l+" "+(i+r).toFixed(1)+" "+s+" "+(o+t).toFixed(1)+" "+Ce+" "+(o+t).toFixed(1)+"Z"}function Br(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function Ir(e){let t=String(de(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function Zr(e,t){return t?e==null||Number.isNaN(e)?mo:e<.15?Fr:e<.4?Lr:e<.7?Mr:Nr:uo}function Wr(){var e=1160,t=460,r=Ye-Ue/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var i=1;i<=ne;i++)o.push('<linearGradient id="rg'+i+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+i+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+i+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var a=1;a<=ne;a++){var s=Je(a-1,ft,bt);o.push('<path d="'+s+'" fill="#1E2233" opacity="0.9"/>')}for(a=1;a<=ne;a++){var l=Je(a-1,ft,bt);o.push('<path id="fd-path-'+a+'" d="'+l+'" fill="url(#rg'+a+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+se+'" y1="36" x2="'+se+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var m=5,u=_e-m;for(o.push('<rect x="0" y="'+r+'" width="'+u+'" height="'+Ue+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+_e+'" y="'+r+'" width="'+Ae+'" height="'+Ue+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(_e+Ae/2)+'" y="'+(Ye-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(_e+Ae/2)+'" y="'+(Ye+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(_e+Ae/2)+'" y="'+(r+Ue+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Fe+'" y="34" font-size="11" fill="'+Xe+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+so+'" y="34" font-size="11" fill="'+Xe+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+io+'" y="34" font-size="11" fill="'+Xe+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+lo+'" y="34" font-size="11" fill="'+Xe+'" font-weight="700" letter-spacing="2">RET</text>'),a=1;a<=ne;a++){var v=po[a-1];o.push('<text id="fd-zn'+a+'" x="'+Fe+'" y="'+(v+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+a+"</text>"),o.push('<text id="fd-zf'+a+'" x="'+Fe+'" y="'+(v+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zsp'+a+'" x="'+(Fe+82)+'" y="'+(v+18)+'" font-size="11" fill="'+vt+'" font-weight="600" font-family="var(--mono)"></text>'),o.push('<text id="fd-zt'+a+'" x="'+so+'" y="'+(v+10)+'" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+a+'" x="'+io+'" y="'+(v+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+a+'" x="'+lo+'" y="'+(v+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Pr+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+ne+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var jr=()=>`<div class="flow-wrap">${Wr()}</div>`;E({tag:"flow-diagram",render:jr,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(ne+1)};for(let i=1;i<=ne;i++)r.zones[i]={textTemp:t.querySelector("#fd-zt"+i),textSetpoint:t.querySelector("#fd-zsp"+i),textFlow:t.querySelector("#fd-zv"+i),textRet:t.querySelector("#fd-zr"+i),label:t.querySelector("#fd-zn"+i),friendly:t.querySelector("#fd-zf"+i),path:t.querySelector("#fd-path-"+i)};function o(){let i=_(n.flow),a=_(n.ret),s=r.flowEl,l=r.retEl,m=r.dtEl;if(s.textContent=Y(i),l.textContent="RET "+Y(a),i!=null&&a!=null){let u=Number(i)-Number(a);m.textContent=u.toFixed(1)+"\xB0C",m.setAttribute("fill",u<3?qr:u>8?Hr:Rr)}else m.textContent="---";for(let u=1;u<=ne;u++){let v=_(p.temp(u)),w=_(p.setpoint(u)),y=_(p.valve(u)),S=I(p.enabled(u)),h=String(A(p.tempSource(u))||"Local Probe"),b=Br(A(p.probe(u))||""),c=b?_(p.probeTemp(b)):null,d=r.zones[u],x=d.textTemp,T=d.textSetpoint,O=d.textFlow,Z=d.textRet,P=d.label,C=d.friendly,k=d.path,R=y!=null?Math.max(0,Math.min(100,Number(y)))/100:0;P.textContent="ZONE "+u;let H=Ir(u);C.textContent=H||"---",P.setAttribute("fill",S?Tr:Or),C.setAttribute("fill",S?co:vt),T.setAttribute("fill",S?co:vt);let G=C.getComputedTextLength?C.getComputedTextLength():0;T.setAttribute("x",String(Fe+G+8));let U=Y(v),B=w!=null?Y(w):null;if(x.textContent=U,T.textContent=B?"("+B+")":"",O.textContent=We(y),O.setAttribute("fill",Zr(R,S)),h!=="Local Probe"&&c!=null&&!Number.isNaN(Number(c))?(Z.textContent=Y(c),Z.setAttribute("fill",S?Dr:uo)):(Z.textContent="---",Z.setAttribute("fill",mo)),!S)k.setAttribute("d",Je(u-1,1,2)),k.setAttribute("fill","#2A2D38"),k.setAttribute("opacity","0.4");else{let le=Math.max(3,R*bt),et=Math.max(1.5,R*ft);k.setAttribute("d",Je(u-1,et,le)),k.setAttribute("fill","url(#rg"+u+")"),k.setAttribute("opacity","1")}}}f(n.flow,o),f(n.ret,o),L("zoneNames",o);for(let i=1;i<=ne;i++)f(p.temp(i),o),f(p.setpoint(i),o),f(p.valve(i),o),f(p.enabled(i),o),f(p.probe(i),o),f(p.tempSource(i),o);for(let i=1;i<=8;i++)f(p.probeTemp(i),o);o()}});var Vr="http://www.w3.org/2000/svg",Gr=24,$r=["N","NE","E","SE","S","SW","W","NW"],fo=1e3,bo=260,ue=44,Ur=46,oe=16,Xr=52,Qe=fo-ue-Ur,ie=bo-oe-Xr,vo="var(--accent)",ho="var(--blue)",Yr=`
.forecast-preview {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.forecast-preview .card-title {
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

.forecast-preview .fc-head-right { display: flex; align-items: center; gap: 12px; }
.forecast-preview .fc-legend { display: flex; gap: 10px; }
.forecast-preview .fc-legend-item {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: .62rem; letter-spacing: .5px; text-transform: uppercase; font-weight: 700;
  color: var(--text-faint);
}
.forecast-preview .fc-legend-dot { width: 8px; height: 8px; border-radius: 999px; }

.forecast-preview .fc-badge {
  font-size: .68rem; font-weight: 800; letter-spacing: .8px; text-transform: uppercase;
  padding: 3px 9px; border-radius: 8px; flex-shrink: 0;
  background: rgba(70,70,70,.28); color: #ADADAD; border: 1px solid rgba(150,150,150,.25);
}
.forecast-preview .fc-badge.ok { background: rgba(45,110,45,.36); color: #CBFFD0; border-color: rgba(100,255,100,.35); }
.forecast-preview .fc-badge.stale { background: rgba(110,90,20,.36); color: #FFE9A0; border-color: rgba(255,200,50,.35); }

.forecast-preview .fc-empty { color: var(--text-secondary); font-size: .8rem; text-align: center; padding: 30px; }

.forecast-preview svg { width: 100%; height: auto; display: block; }
.forecast-preview .fc-grid { stroke: rgba(143,176,230,.16); stroke-width: 1; }
.forecast-preview .fc-axis { stroke: rgba(143,176,230,.42); stroke-width: 1; }
.forecast-preview .fc-tick { font-size: 11px; fill: var(--text-faint); }
.forecast-preview .fc-hour { font-size: 12px; fill: var(--text-secondary); font-weight: 700; }
.forecast-preview .fc-dir  { font-size: 10px; fill: var(--accent); font-family: var(--mono); }
`;z("forecast-preview",Yr);var Jr=()=>`
  <div class="forecast-preview">
    <div class="card-title">
      <span>Forecast (fetched)</span>
      <div class="fc-head-right">
        <div class="fc-legend">
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${vo}"></span>Temp</span>
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${ho}"></span>Wind</span>
        </div>
        <span class="fc-badge">no data</span>
      </div>
    </div>
    <div class="fc-body"></div>
  </div>
`;function Qr(e){return e==null||Number.isNaN(e)?"":$r[Math.round(e/45)%8]}function Kr(e){return String(new Date(e*1e3).getHours()).padStart(2,"0")}function ea(e){return e==null?"":e<5400?Math.round(e/60)+" min old":Math.round(e/3600)+" h old"}function te(e,t,r){let o=document.createElementNS(Vr,e);if(t)for(let i in t)o.setAttribute(i,t[i]);return r!=null&&(o.textContent=r),o}function go(e,t,r){let o=e.filter(l=>Number.isFinite(l));if(!o.length)return{min:t,max:r};let i=Math.min(...o),a=Math.max(...o);i===a&&(i-=1,a+=1);let s=(a-i)*.12;return{min:i-s,max:a+s}}function ta(e){let t=e.hours.slice(0,Gr),r=t.map(b=>b[0]),o=t.map(b=>b[1]),i=go(r,0,10),a=go(o.concat([0]),0,10);a.min=0;let s=t.length,l=b=>ue+(s<=1?0:b/(s-1)*Qe),m=b=>oe+(1-(b-i.min)/(i.max-i.min))*ie,u=b=>oe+(1-(b-a.min)/(a.max-a.min))*ie,v=te("svg",{viewBox:"0 0 "+fo+" "+bo,preserveAspectRatio:"xMidYMid meet"});for(let b=0;b<3;b++){let c=b/2,d=oe+c*ie;v.appendChild(te("line",{x1:ue,y1:d,x2:ue+Qe,y2:d,class:"fc-grid"})),v.appendChild(te("text",{x:ue-6,y:d+4,"text-anchor":"end",class:"fc-tick"},(i.max-(i.max-i.min)*c).toFixed(0)+"\xB0")),v.appendChild(te("text",{x:ue+Qe+6,y:d+4,"text-anchor":"start",class:"fc-tick"},(a.max-(a.max-a.min)*c).toFixed(0)))}v.appendChild(te("line",{x1:ue,y1:oe+ie,x2:ue+Qe,y2:oe+ie,class:"fc-axis"}));let w="";for(let b=0;b<s;b++)w+=(b?" L ":"M ")+l(b).toFixed(1)+" "+u(o[b]).toFixed(1);let y=w+" L "+l(s-1).toFixed(1)+" "+(oe+ie)+" L "+l(0).toFixed(1)+" "+(oe+ie)+" Z";v.appendChild(te("path",{d:y,fill:"rgba(83,168,255,.12)"})),v.appendChild(te("path",{d:w,fill:"none",stroke:ho,"stroke-width":"2.4","stroke-linejoin":"round","stroke-linecap":"round"}));let S="";for(let b=0;b<s;b++)S+=(b?" L ":"M ")+l(b).toFixed(1)+" "+m(r[b]).toFixed(1);v.appendChild(te("path",{d:S,fill:"none",stroke:vo,"stroke-width":"2.4","stroke-linejoin":"round","stroke-linecap":"round"}));let h=s>16?3:2;for(let b=0;b<s;b+=h){let c=l(b),d=e.base_epoch+b*3600;v.appendChild(te("text",{x:c,y:oe+ie+18,"text-anchor":"middle",class:"fc-hour"},Kr(d))),v.appendChild(te("text",{x:c,y:oe+ie+34,"text-anchor":"middle",class:"fc-dir"},Qr(t[b][2])))}return v}var ks=E({tag:"monitor-forecast-preview",render:Jr,onMount(e,t){let r=t.querySelector(".fc-badge"),o=t.querySelector(".fc-body");function i(){let a=Ft(),s=a&&Array.isArray(a.hours)?a.hours:[];if(!(a?a.count||s.length:0)||!s.length||!a.base_epoch){r.textContent="no data",r.className="fc-badge",o.innerHTML='<div class="fc-empty">No forecast data fetched yet. Enable Forecast Preload in Settings and check the location.</div>';return}let m=(a.age_s||0)>3*3600;r.textContent=ea(a.age_s),r.className="fc-badge "+(m?"stale":"ok"),o.innerHTML="",o.appendChild(ta(a))}L("forecastHours",i),i()}});var oa={1:{label:"E",color:"#ff6464"},2:{label:"W",color:"#f2c77b"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#53A8FF"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},ra=`
.logs-view {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--panel-shadow);
}

.logs-view .card-title {
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

.logs-view .actions { display: flex; gap: 6px; }
.logs-view .btn {
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 8px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .6px;
  cursor: pointer;
}
.logs-view .btn:hover { color: var(--text-strong); background: var(--control-bg-hover); }
.logs-view .btn.on { color: var(--text-on-accent); border-color: var(--accent); background: var(--accent); }

.logs-stream {
  margin-top: 4px;
  height: 420px;
  overflow-y: auto;
  border-radius: 10px;
  background: rgba(8,18,34,.55);
  border: 1px solid var(--control-border);
  padding: 6px 0;
  font-family: var(--mono);
  scrollbar-width: thin;
  scrollbar-color: rgba(83,168,255,.25) transparent;
}
.logs-stream::-webkit-scrollbar { width: 6px; }
.logs-stream::-webkit-scrollbar-thumb { background: rgba(83,168,255,.25); border-radius: 999px; }

.logs-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 24px; }

.log-line {
  display: grid;
  grid-template-columns: 18px 96px 1fr;
  gap: 8px;
  padding: 2px 12px;
  font-size: .72rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-line .lv { font-weight: 800; text-align: center; }
.log-line .tag { color: var(--accent); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-line .msg { color: var(--text-strong); opacity: .92; }
`;z("logs-view",ra);var aa=()=>`
  <div class="logs-view">
    <div class="card-title">
      <span>Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button">Pause</button>
        <button class="btn clear-btn" type="button">Clear</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;function na(e){let t=oa[e.level]||{label:"?",color:"var(--text-secondary)"},r=xo(e.tag||""),o=xo(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+r+'</span><span class="msg">'+o+"</span></div>"}function xo(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Ls=E({tag:"logs-view",render:aa,onMount(e,t){let r=t.querySelector(".logs-stream"),o=t.querySelector(".pause-btn"),i=t.querySelector(".clear-btn"),a=!1;function s(){if(a)return;let l=Ct();if(!l||!l.length){r.innerHTML='<div class="logs-empty">Waiting for device logs\u2026</div>';return}let m=r.scrollHeight-r.scrollTop-r.clientHeight<40;r.innerHTML=l.map(na).join(""),m&&(r.scrollTop=r.scrollHeight)}o.addEventListener("click",()=>{a=!a,o.textContent=a?"Resume":"Pause",o.classList.toggle("on",a),a||s()}),i.addEventListener("click",()=>{At()}),L("deviceLog",s),s()}});var sa=`
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
}`;z("diag-i2c",sa);var ia=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Ps=E({tag:"diag-i2c",render:ia,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=M("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Ot()}),L("i2cResult",o),o()}});var la=`
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
`;z("diag-activity",la);var da=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function ca(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Is=E({tag:"diag-activity",render:da,onMount(e,t){let r=t.querySelector(".diag-log");function o(){ca(r,kt())}L("activityLog",o),o()}});var pa=`
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
`;z("diag-manual-badge",pa);var ua=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Gs=E({tag:"diag-manual-badge",render:ua,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let i=!!M("manualMode");r&&r.classList.toggle("on",i)}L("manualMode",o),o()}});var ma=`
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
`;z("diag-zone-motor",ma);var ga=e=>{let t=e.zone||M("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Ks=E({tag:"diag-zone-motor-card",render:ga,onMount(e,t){let r=Number(e.zone||M("selectedZone")||1),o=!!M("manualMode"),i=t.querySelector(".manual-mode-toggle"),a=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),l=t.querySelector(".motor-target-input"),m=t.querySelector(".motor-open-btn"),u=t.querySelector(".motor-close-btn"),v=t.querySelector(".motor-stop-btn");function w(h){o=!!h,i&&(i.classList.toggle("on",o),i.setAttribute("aria-checked",o?"true":"false")),a&&a.classList.toggle("locked",!o),[s,l,m,u,v].forEach(b=>{b&&(b.disabled=!o)})}function y(){let h=!o;if(w(h),h){nt(!0);for(let b=1;b<=6;b++)at(b)}else nt(!1)}function S(){let h=_(p.motorTarget(r));l&&h!=null?l.value=Number(h).toFixed(0):l&&(l.value="0")}s==null||s.addEventListener("change",()=>{r=Number(s.value||1),S()}),i==null||i.addEventListener("click",y),i==null||i.addEventListener("keydown",h=>{h.key!==" "&&h.key!=="Enter"||(h.preventDefault(),y())});for(let h=1;h<=6;h++)f(p.motorTarget(h),S);S(),w(o),L("manualMode",()=>{w(!!M("manualMode"))}),l==null||l.addEventListener("change",h=>{if(!o)return;let b=h.target.value;qt(r,b)}),m==null||m.addEventListener("click",()=>{o&&Rt(r,1e4)}),u==null||u.addEventListener("click",()=>{o&&Ht(r,1e4)}),v==null||v.addEventListener("click",()=>{o&&at(r)})}});var fa=`
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
.diag-zone-recovery .recovery-note {
  color: var(--text-secondary);
  font-size: .76rem;
  line-height: 1.4;
  margin-bottom: 12px;
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
`;z("diag-zone-recovery",fa);var ba=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title">Faults &amp; Relearn</div>
      <div class="recovery-note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
    </div>
  `,ni=E({tag:"diag-zone-recovery-card",render:ba,onMount(e,t){let r=Number(M("selectedZone")||1),o=t.querySelector(".recovery-fault-btn"),i=t.querySelector(".recovery-factors-btn"),a=t.querySelector(".recovery-relearn-btn");L("selectedZone",()=>{r=Number(M("selectedZone")||1)}),o==null||o.addEventListener("click",()=>{Bt(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset learned factors for "+re(r)+"?")&&It(r)}),a==null||a.addEventListener("click",()=>{confirm("Reset + relearn motor for "+re(r)+"?")&&Zt(r)})}});var va=`
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
  font-family: var(--mono);
}

@media (max-width: 900px) {
  .settings-manifold-card .probe-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
`;z("settings-manifold-card",va);var ha=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title">Manifold Configuration</div>
      <div class="ui-row">
        <span class="ui-label">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${e}</select></span>
      </div>
      <div class="ui-section">Probe Temperatures</div>
      <div class="probe-grid">${t}</div>
    </div>
  `},gi=E({tag:"settings-manifold-card",render:ha,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),i=t.querySelector(".sm-ret"),a=X(t);a.select(r,{read:()=>A(n.manifoldType)||"NO (Normally Open)",commit:l=>J("manifold_type",l)}),a.select(o,{read:()=>A(n.manifoldFlowProbe)||"Probe 7",commit:l=>J("manifold_flow_probe",l)}),a.select(i,{read:()=>A(n.manifoldReturnProbe)||"Probe 8",commit:l=>J("manifold_return_probe",l)});function s(){for(let l=1;l<=8;l++){let m=t.querySelector('[data-probe="'+l+'"]');m&&(m.textContent=Y(_(p.probeTemp(l))))}}f(n.manifoldType,a.refresh),f(n.manifoldFlowProbe,a.refresh),f(n.manifoldReturnProbe,a.refresh);for(let l=1;l<=8;l++)f(p.probeTemp(l),s);a.refresh(),s()}});var xa=`
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

/* Shared toggle styling for consistency across settings cards */
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
`;z("settings-control-card",xa);var ya=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,xi=E({tag:"settings-control-card",render:ya,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ce("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ce("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ce("restart")})}});var wa=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(238,161,17,.35);
  background: rgba(238,161,17,.12);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 10px 0 2px;
}
`;z("settings-motor-calibration-card",wa);var Ke=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:n.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:n.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:n.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:n.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:n.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:n.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:n.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:n.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:n.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:n.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:n.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:n.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],_a=()=>{let e="";for(let t=0;t<Ke.length;t++){let r=Ke[t],o=za(r.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label">'+r.label+" ("+r.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+r.cls+'" value="0" step="'+o+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title">Motor Calibration & Learning</div>
      <div class="ui-row">
        <span class="ui-label">Motor Drivers</span>
        <span class="ui-field"><div class="ui-toggle mc-drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div></span>
      </div>
      <div class="ui-note">Default starting thresholds and learning bounds used by the motor controller.</div>

      <div class="ui-section">Profile</div>
      <div class="ui-row">
        <span class="ui-label">Motor Type (Default Profile)</span>
        <span class="ui-field"><select class="ui-select smc-profile">
          <option value="Generic">Generic</option>
          <option value="HmIP VdMot">HmIP VdMot</option>
        </select></span>
      </div>
      <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>

      <div class="ui-section">Thresholds &amp; Learning</div>
      ${e}
    </div>
  `};function za(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var Ci=E({tag:"settings-motor-calibration-card",render:_a,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime"),i=t.querySelector(".mc-drivers-toggle"),a=X(t);function s(m){if(m==="HmIP VdMot"&&Q("hmip_runtime_limit_seconds",40),m==="Generic"){let u=Number(_(n.genericRuntimeLimitSeconds));(!Number.isFinite(u)||u<=0)&&Q("generic_runtime_limit_seconds",45)}}a.toggle(i,{read:()=>I(n.drivers),commit:m=>Be(m)}),a.select(r,{read:()=>A(n.motorProfileDefault)||"HmIP VdMot",commit:m=>{J("motor_profile_default",m),s(m)}});function l(){let m=A(n.motorProfileDefault)||"HmIP VdMot";o.disabled=m==="HmIP VdMot"}a.num(o,{read:()=>(A(n.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:_(n.genericRuntimeLimitSeconds),commit:m=>{r.value==="Generic"&&Q("generic_runtime_limit_seconds",m)}});for(let m=0;m<Ke.length;m++){let u=Ke[m];if(u.key==="generic_runtime_limit_seconds")continue;let v=t.querySelector(".smc-"+u.cls);v&&(a.num(v,{read:()=>_(u.id),commit:w=>Q(u.key,w)}),f(u.id,a.refresh))}f(n.drivers,a.refresh),f(n.motorProfileDefault,()=>{a.refresh(),l()}),f(n.genericRuntimeLimitSeconds,a.refresh),f(n.hmipRuntimeLimitSeconds,a.refresh),s(A(n.motorProfileDefault)||"HmIP VdMot"),a.refresh(),l()}});var Sa=`
.settings-asgard-card .asgard-role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.settings-asgard-card .asgard-role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.settings-asgard-card .asgard-role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.settings-asgard-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-top: 8px;
}
.settings-asgard-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
  margin-top: 8px;
}
.settings-asgard-card .status-grid .val { color: var(--text); font-weight: 600; }
.settings-asgard-card .status-grid .val.warn { color: #FFE9A0; }
`;z("settings-asgard-card",Sa);var ka=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span>Asgard / Ecodan Bridge</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="ui-row">
      <span class="ui-label">Bridge enabled</span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label">Coordinator <span class="ui-sublabel">pushes to Asgard</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section">Asgard</div>
      <div class="ui-row">
        <span class="ui-label">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Number entity <span class="ui-sublabel">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section">Peer board</div>
      <div class="ui-row">
        <span class="ui-label">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
      </div>

      <div class="ui-section">Minimum zone flow</div>
      <div class="ui-row">
        <span class="ui-label">Min valve opening (%) <span class="ui-sublabel">floor held on every enabled zone so the heat pump always has flow</span></span>
        <span class="ui-field"><input class="ui-input sa-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
      </div>

      <div class="ui-section">Recommended setpoint</div>
      <div class="setpoint-box">
        <span class="setpoint-val sa-st-setpoint">\u2014</span>
        <span class="ui-note">Fixed value to set as the virtual thermostat setpoint in Asgard \u2014 the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
      </div>

      <div class="ui-section">Status</div>
      <div class="status-grid">
        <span>Peer</span><span class="val sa-st-peer">n/a</span>
        <span>Last push</span><span class="val sa-st-push">\u2014</span>
        <span>Zones weighted</span><span class="val sa-st-zones">\u2014</span>
        <span>Last error</span><span class="val sa-st-err">\u2014</span>
      </div>
    </div>
  </div>
`,Oi=E({tag:"settings-asgard-card",render:ka,onMount(e,t){let r=t.querySelector(".asgard-role-badge"),o=t.querySelector(".sa-enable"),i=t.querySelector(".sa-coord"),a=t.querySelector(".sa-host"),s=t.querySelector(".sa-port"),l=t.querySelector(".sa-entity"),m=t.querySelector(".sa-peer"),u=t.querySelector(".sa-interval"),v=t.querySelector(".sa-minflow"),w=t.querySelector(".sa-st-peer"),y=t.querySelector(".sa-st-push"),S=t.querySelector(".sa-st-setpoint"),h=t.querySelector(".sa-st-zones"),b=t.querySelector(".sa-st-err"),c=t.querySelector(".sa-body"),d=X(t);function x(C,k,R){return H=>{let G=H?"on":"off";g(C,{state:G}),J(k,G).catch(U=>{console.error(`[Asgard] Failed to update ${R}:`,U),g(C,{state:H?"off":"on"})})}}let T=C=>c.classList.toggle("is-disabled",!C);d.toggle(o,{read:()=>I(n.asgardEnabled),commit:x(n.asgardEnabled,"asgard_enabled","enabled"),onChange:T}),d.toggle(i,{read:()=>I(n.asgardCoordinator),commit:x(n.asgardCoordinator,"asgard_coordinator","coordinator")});function O(C,k){return R=>{g(C,{state:R}),Pt(k,R).catch(H=>console.error(`[Asgard] Failed to update ${k}:`,H))}}d.text(a,{read:()=>A(n.asgardHost),commit:O(n.asgardHost,"asgard_host")}),d.text(l,{read:()=>A(n.asgardEntityName),commit:O(n.asgardEntityName,"asgard_entity_name")}),d.text(m,{read:()=>A(n.asgardPeerHost),commit:O(n.asgardPeerHost,"asgard_peer_host")});function Z(C,k){return R=>{g(C,{value:R}),Q(k,R).catch(H=>console.error(`[Asgard] Failed to update ${k}:`,H))}}d.num(s,{read:()=>_(n.asgardPort),commit:Z(n.asgardPort,"asgard_port")}),d.num(u,{read:()=>_(n.asgardPushIntervalS),commit:Z(n.asgardPushIntervalS,"asgard_push_interval_s")}),d.num(v,{read:()=>_(n.minZoneFlowPct),commit:Z(n.minZoneFlowPct,"min_zone_flow_pct")});function P(){let C=A(n.asgardRole)||"slave";r.textContent=C,r.className="asgard-role-badge "+(C==="master"?"master":"slave");let k=A(n.asgardPeerStatus)||"n/a";w.textContent=k,w.classList.toggle("warn",k==="stale"||k==="unreachable");let R=_(n.asgardLastPushC),H=_(n.asgardLastPushAgeS);if(R!=null&&Number.isFinite(R)&&H!=null){let et=H<120?`${Math.round(H)}s ago`:`${Math.round(H/60)}m ago`;y.textContent=`${R.toFixed(2)}\xB0C (${et})`}else y.textContent="\u2014";let G=_(n.asgardSetpointC);S.textContent=G!=null&&Number.isFinite(G)?`${G.toFixed(1)}\xB0C`:"\u2014";let U=_(n.asgardLocalZones),B=_(n.asgardPeerZones);h.textContent=U!=null?`${U} local + ${B||0} peer`:"\u2014";let le=A(n.asgardLastError);b.textContent=le||"\u2014",b.classList.toggle("warn",!!le)}f(n.asgardEnabled,d.refresh),f(n.asgardCoordinator,d.refresh),f(n.asgardRole,P),f(n.asgardPeerStatus,P),f(n.asgardLastPushC,P),f(n.asgardSetpointC,P),f(n.asgardLastPushAgeS,P),f(n.asgardLocalZones,P),f(n.asgardPeerZones,P),f(n.asgardLastError,P),f(n.asgardHost,d.refresh),f(n.asgardEntityName,d.refresh),f(n.asgardPeerHost,d.refresh),f(n.asgardPort,d.refresh),f(n.asgardPushIntervalS,d.refresh),f(n.minZoneFlowPct,d.refresh),d.refresh(),P()}});var yo=[1,2,3,4,5,6],Ea=`
.settings-forecast-card .fc-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}
.settings-forecast-card .fc-badge.ok {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
.settings-forecast-card .fc-badge.stale,
.settings-forecast-card .fc-badge.external {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border-color: rgba(255,200,50,.35);
}

.settings-forecast-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-forecast-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-forecast-card .zone-table th:first-child { text-align: left; }
.settings-forecast-card .zone-table td { padding: 4px 2px; text-align: center; }
.settings-forecast-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; }
.settings-forecast-card .zone-table .offset-cell { font-weight: 700; color: var(--text-secondary); font-family: var(--mono); }
.settings-forecast-card .zone-table .offset-cell.active { color: #CBFFD0; }
`;z("settings-forecast-card",Ea);var Ca=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,Aa=()=>`
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span>Forecast Preload</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="ui-row">
      <span class="ui-label">Wind preload enabled</span>
      <span class="ui-field"><div class="ui-toggle fc-enable" role="switch" aria-label="Toggle forecast preload"></div></span>
    </div>
    <div class="ui-note">Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.</div>

    <div class="gated-body fc-body">
      <div class="ui-section">Location</div>
      <div class="ui-row">
        <span class="ui-label">Latitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" data-nostep /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Longitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" data-nostep /></span>
      </div>

      <div class="ui-section">Model</div>
      <div class="ui-row">
        <span class="ui-label">Load threshold</span>
        <span class="ui-field"><input class="ui-input fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max offset (\xB0C)</span>
        <span class="ui-field"><input class="ui-input fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></span>
      </div>

      <div class="ui-section">Per-zone preload (now)</div>
      <table class="zone-table">
        <thead>
          <tr><th>Zone</th><th>Active offset</th></tr>
        </thead>
        <tbody class="fc-zone-body">
          ${yo.map(Ca).join("")}
        </tbody>
      </table>
      <div class="ui-note fc-note">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
  </div>
`,Wi=E({tag:"settings-forecast-card",render:Aa,onMount(e,t){let r=t.querySelector(".fc-badge"),o=t.querySelector(".fc-enable"),i=t.querySelector(".fc-body"),a=t.querySelector(".fc-lat"),s=t.querySelector(".fc-lon"),l=t.querySelector(".fc-threshold"),m=t.querySelector(".fc-maxoffset"),u=X(t),v=h=>{i&&i.classList.toggle("is-disabled",!h)};u.toggle(o,{read:()=>I(n.forecastEnabled),onChange:v,commit:h=>{let b=h?"on":"off";g(n.forecastEnabled,{state:b}),J("forecast_enabled",b).catch(c=>{console.error("[Forecast] toggle failed:",c),g(n.forecastEnabled,{state:h?"off":"on"})})}});function w(h,b){return c=>{g(h,{value:c}),Q(b,c).catch(d=>console.error(`[Forecast] ${b} failed:`,d))}}u.num(a,{nostep:!0,read:()=>_(n.forecastLatitude),commit:w(n.forecastLatitude,"forecast_latitude")}),u.num(s,{nostep:!0,read:()=>_(n.forecastLongitude),commit:w(n.forecastLongitude,"forecast_longitude")}),u.num(l,{read:()=>_(n.forecastLoadThreshold),commit:w(n.forecastLoadThreshold,"forecast_load_threshold")}),u.num(m,{read:()=>_(n.forecastMaxOffsetC),commit:w(n.forecastMaxOffsetC,"forecast_max_offset_c")});function y(){let h=A(n.forecastStatus)||"disabled";r.textContent=h,r.className="fc-badge",h==="ok"?r.classList.add("ok"):(h==="stale"||h.indexOf("external")>=0)&&r.classList.add("external")}function S(){t.querySelectorAll(".fc-zone-body tr").forEach(h=>{let b=parseInt(h.getAttribute("data-zone"),10),c=h.querySelector(".fc-offset"),d=_(p.forecastOffset(b)),x=_(p.forecastPeakH(b));d!=null&&d>.01?(c.textContent=`+${d.toFixed(1)}\xB0`+(x!=null&&x>=0?` (${x}h)`:""),c.classList.add("active")):(c.textContent="\u2014",c.classList.remove("active"))})}f(n.forecastStatus,y),f(n.forecastEnabled,()=>{u.refresh(),y()}),f(n.forecastLatitude,u.refresh),f(n.forecastLongitude,u.refresh),f(n.forecastLoadThreshold,u.refresh),f(n.forecastMaxOffsetC,u.refresh),yo.forEach(h=>{f(p.forecastOffset(h),S)}),y(),S(),u.refresh()}});var Fa=`
.smart-preheat-card .absorb-badge {
  font-size: .7rem;
  font-weight: 800;
  letter-spacing: .8px;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 8px;
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}

.smart-preheat-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}
`;z("smart-preheat-card",Fa);var La=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title">Preheat</div>
    <div class="ui-row">
      <span class="ui-label">Simple Preheat</span>
      <span class="ui-field"><div class="ui-toggle preheat-toggle" role="switch" aria-label="Toggle simple preheat"></div></span>
    </div>
    <div class="ui-note">Learns a per-zone head-start so a room reaches its setpoint on time despite slab lag.</div>

    <div class="ui-divider"></div>
    <div class="ui-row">
      <span class="ui-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
      <span class="ui-field"><div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div></span>
    </div>
    <div class="ui-note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
      <div class="ui-row">
        <span class="ui-label">Absorb band (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Detect delta (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  </div>
`,Ji=E({tag:"smart-preheat-card",render:La,onMount(e,t){let r=t.querySelector(".preheat-toggle"),o=t.querySelector(".absorb-toggle"),i=t.querySelector(".absorb-badge"),a=t.querySelector(".absorb-band"),s=t.querySelector(".absorb-delta"),l=t.querySelector(".absorb-body");function m(){let y=String(A(n.simplePreheatEnabled)||"").toLowerCase();return y==="on"||y==="true"||y==="1"||y==="enabled"}let u=X(t);u.toggle(r,{read:m,commit:y=>J("simple_preheat_enabled",y?"on":"off")});let v=y=>{l&&l.classList.toggle("is-disabled",!y)};u.toggle(o,{read:()=>I(n.preheatAbsorbEnabled),onChange:v,commit:y=>{let S=y?"on":"off";g(n.preheatAbsorbEnabled,{state:S}),J("preheat_absorb_enabled",S)}}),u.num(a,{read:()=>_(n.preheatAbsorbBandC),commit:y=>{g(n.preheatAbsorbBandC,{value:y}),Q("preheat_absorb_band_c",y)}}),u.num(s,{read:()=>_(n.preheatDetectDeltaC),commit:y=>{g(n.preheatDetectDeltaC,{value:y}),Q("preheat_detect_delta_c",y)}});function w(){let y=String(A(n.preheatAbsorbing)||"").toLowerCase()==="active";i.textContent=y?"active":"idle",i.classList.toggle("active",y)}f(n.simplePreheatEnabled,u.refresh),f(n.preheatAbsorbEnabled,u.refresh),f(n.preheatAbsorbing,w),f(n.preheatAbsorbBandC,u.refresh),f(n.preheatDetectDeltaC,u.refresh),u.refresh(),w()}});var Ma=`
.settings-smart-heating {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

/* De-chrome the nested cards so they sit flush inside this panel. */
.settings-smart-heating .smart-preheat-card,
.settings-smart-heating .settings-forecast-card {
  background: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;
}

/* The inner card titles ("Preheat" / "Forecast Preload") become subsection heads. */
.settings-smart-heating .sh-section + .sh-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--panel-border);
}
`;z("settings-smart-heating",Ma);var Na=()=>`
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`,tl=E({tag:"settings-smart-heating-card",render:Na,onMount(e,t){t.querySelector(".sh-preheat-slot").appendChild(q("smart-preheat-card")),t.querySelector(".sh-forecast-slot").appendChild(q("settings-forecast-card"))}});var Da=`
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
html { font-size: 12px; scroll-behavior: smooth; }
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
.zone-diag-layout,
.logs-diag-layout {
  display: grid;
  gap: 14px;
}

.zone-diag-layout,
.logs-diag-layout {
  grid-template-columns: repeat(3, 1fr);
  align-items: start;
}

.zone-layout {
  grid-template-columns: 1fr 1fr 1fr;
  align-items: stretch;
}

.zone-detail-slot,
.zone-sensor-slot,
.zone-room-slot,
.zone-recovery-slot {
  display: flex;
}

.zone-detail-slot > *,
.zone-sensor-slot > *,
.zone-room-slot > *,
.zone-recovery-slot > * {
  flex: 1;
}

/* Middle column stacks the sensor (connectivity) and fault/relearn cards,
   stretching to match the Zone and Zone Settings columns' height. */
.zone-mid-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.zone-mid-col > * { width: 100%; }

/* Single row of 4 equal-height columns; cards stretch to fill via flex. */
.settings-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  align-items: stretch;
}
.settings-layout > * { display: flex; }
.settings-layout > * > * { flex: 1; }

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

@media (max-width: 1200px) {
  .settings-layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 1080px) {
  .zone-diag-layout,
  .logs-diag-layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .zone-diag-layout,
  .logs-diag-layout { grid-template-columns: 1fr; }

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

/* Gated card body: faded + non-interactive when its feature is disabled.
   The enable toggle stays outside this wrapper so it remains clickable. */
.gated-body {
  transition: opacity .2s ease;
}
.gated-body.is-disabled {
  opacity: .42;
  pointer-events: none;
  user-select: none;
}
`;z("app-root",Da);var Ta=e=>`
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
        <div class="overview-forecast" style="margin-top:14px"></div>
      </section>
      <section class="sec" data-section="zones">
        <div class="zone-selector"></div>
        <div class="zone-layout">
          <div class="zone-detail-slot"></div>
          <div class="zone-mid-col">
            <div class="zone-sensor-slot"></div>
            <div class="zone-recovery-slot"></div>
          </div>
          <div class="zone-room-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="settings">
        <div class="settings-layout">
          <div class="settings-manifold-slot"></div>
          <div class="settings-asgard-slot"></div>
          <div class="settings-motor-cal-slot"></div>
          <div class="settings-smart-heating-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="logs">
        <div class="logs-stream-slot"></div>
        <div class="logs-diag-layout" style="margin-top:14px"></div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;E({tag:"app-root",render:Ta,onMount(e,t){t.querySelector(".hdr").appendChild(q("hv6-header")),t.querySelector(".overview-flow").appendChild(q("flow-diagram")),t.querySelector(".overview-timeline").appendChild(q("zone-state-timeline")),t.querySelector(".overview-connectivity").appendChild(q("connectivity-card")),t.querySelector(".overview-flow-return").appendChild(q("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(q("graph-widgets",{variant:"demand"})),t.querySelector(".overview-forecast").appendChild(q("monitor-forecast-preview")),t.querySelector(".zone-selector").appendChild(q("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(q("zone-detail",{zone:M("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(q("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(q("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(q("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(q("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(q("settings-asgard-card")),t.querySelector(".settings-motor-cal-slot").appendChild(q("settings-motor-calibration-card")),t.querySelector(".settings-smart-heating-slot").appendChild(q("settings-smart-heating-card")),t.querySelector(".logs-stream-slot").appendChild(q("logs-view"));let r=t.querySelector(".logs-diag-layout");r.appendChild(q("diag-zone-motor-card",{zone:M("selectedZone")||1})),r.appendChild(q("settings-control-card")),r.appendChild(q("diag-manual-badge")),r.appendChild(q("diag-i2c")),r.appendChild(q("diag-activity"));let o=t.querySelectorAll(".sec");function i(){let a=M("section");o.forEach(s=>{s.classList.toggle("active",s.getAttribute("data-section")===a)})}L("section",i),i()}});function Oa(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(q("app-root")),ct()}Oa();})();

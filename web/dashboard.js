(()=>{var Vt={},Xe={};function T(t){return Vt[t.tag]=t,t}function j(t,e){let o=Vt[t];if(!o)throw new Error("Component not found: "+t);let r=e||{};if(o.state){let s=o.state(e||{});for(let p in s)r[p]=s[p]}if(o.methods)for(let s in o.methods)r[s]=o.methods[s];let a=document.createElement("div");a.innerHTML=o.render(r);let i=a.firstElementChild;return o.onMount&&o.onMount(r,i),i}function S(t,e){(Xe[t]||(Xe[t]=[])).push(e)}function ne(t){let e=Xe[t];if(e)for(let o=0;o<e.length;o++)e[o](t)}var ie=6,sr=28,Ye=Object.create(null),ir=dr(),I={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:cr(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:ir,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},lr=300;function cr(){let t=Object.create(null);for(let e=1;e<=ie;e++)t[e]=[];return t}function dr(){let t=[];try{t=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(e){t=[]}for(;t.length<ie;)t.push("");return t.slice(0,ie)}function pr(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(I.zoneNames))}catch(t){}}function le(t){return"$dashboard:"+t}function _t(t){return Math.max(1,Math.min(ie,Number(t)||1))}function Gt(t){if(t==null)return null;if(typeof t=="number")return Number.isFinite(t)?t:null;if(typeof t=="string"){let e=Number(t);if(!Number.isNaN(e))return e;let o=t.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function L(t){let e=Ye[t];return e?e.v!=null?e.v:e.value!=null?e.value:Gt(e.s!=null?e.s:e.state):null}function D(t){let e=Ye[t];return e?e.s!=null?e.s:e.state!=null?e.state:e.v===!0?"ON":e.v===!1?"OFF":e.value===!0?"ON":e.value===!1?"OFF":"":""}function ur(t){return t===!0?!0:t===!1?!1:String(t||"").toLowerCase()==="on"}function ee(t){return ur(D(t))}function x(t,e){let o=Ye[t];o||(o=Ye[t]={v:null,s:null}),"v"in e&&(o.v=e.v,o.value=e.v),"value"in e&&(o.v=e.value,o.value=e.value),"s"in e&&(o.s=e.s,o.state=e.s),"state"in e&&(o.s=e.state,o.state=e.state);for(let r in e)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=e[r]);if(ne(t),t==="text_sensor-firmware_version"&&Te("firmwareVersion",D(t)||""),t.startsWith("text-zone_")&&t.endsWith("_name")){let r=parseInt(t.slice(10,-5),10);if(r>=1&&r<=ie){let a=D(t)||"";I.zoneNames[r-1]!==a&&(I.zoneNames[r-1]=a,pr(),ne(le("zoneNames")))}}}function q(t,e){S(le(t),e)}function B(t){return I[t]}function Te(t,e){I[t]=e,ne(le(t))}function Ut(t){let e=t==="logs"?"diagnostics":t;I.section!==e&&(I.section=e,ne(le("section")))}function Xt(t){let e=_t(t);I.selectedZone!==e&&(I.selectedZone=e,ne(le("selectedZone")))}function De(t){let e=!!t;I.live!==e&&(I.live=e,ne(le("live")))}function Yt(){I.pendingWrites+=1,ne(le("pendingWrites"))}function kt(){I.pendingWrites=Math.max(0,I.pendingWrites-1),I.lastWriteAt=Date.now(),ne(le("pendingWrites"))}function Kt(){return I.pendingWrites>0?!0:Date.now()-I.lastWriteAt<2e3}function _e(t){return I.zoneNames[_t(t)-1]||""}function Y(t){let e=_t(t),o=_e(e);return o?"Zone "+e+" \xB7 "+o:"Zone "+e}function Pe(t){I.i2cResult=t||"No scan has been run yet.",ne(le("i2cResult"))}function P(t,e){let o={time:gr(),msg:String(t||"")};for(I.activityLog.push(o);I.activityLog.length>60;)I.activityLog.shift();if(e>=1&&e<=ie){let r=I.zoneLog[e];for(r.push(o);r.length>8;)r.shift();ne(le("zoneLog:"+e))}ne(le("activityLog"))}function St(t,e){let o=I[t];if(!Array.isArray(o))return;let r=Gt(e);if(r!=null){for(o.push(r);o.length>sr;)o.shift();ne(le(t))}}function Be(t){let e=Date.now();if(!t&&e-I.lastHistoryAt<3200)return;I.lastHistoryAt=e;let o=0,r=0;for(let a=1;a<=ie;a++){let i=L("sensor-zone_"+a+"_valve_pct");i!=null&&(o+=i,r+=1)}St("historyFlow",L("sensor-manifold_flow_temperature")),St("historyReturn",L("sensor-manifold_return_temperature")),St("historyDemand",r?o/r:0)}function gr(){let t=new Date;return String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")}function Ke(t){I.zoneStateHistory=t||null,ne(le("zoneStateHistory"))}function Jt(){return I.deviceLogSeq}function Je(t,e){if(Array.isArray(t)&&t.length){for(let o of t)I.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>I.deviceLogSeq&&(I.deviceLogSeq=o[0]);for(;I.deviceLog.length>lr;)I.deviceLog.shift();ne(le("deviceLog"))}typeof e=="number"&&e>I.deviceLogSeq&&(I.deviceLogSeq=e-1)}function Qt(){return I.deviceLog}function eo(){I.deviceLog=[],ne(le("deviceLog"))}function Qe(t){I.forecastHours=t||null,ne(le("forecastHours"))}function et(){return I.forecastHours}var c={temp:t=>"sensor-zone_"+t+"_temperature",setpoint:t=>"number-zone_"+t+"_setpoint",climate:t=>"climate-zone_"+t,valve:t=>"sensor-zone_"+t+"_valve_pct",state:t=>"text_sensor-zone_"+t+"_state",enabled:t=>"switch-zone_"+t+"_enabled",probe:t=>"select-zone_"+t+"_probe",tempSource:t=>"select-zone_"+t+"_temp_source",syncTo:t=>"select-zone_"+t+"_sync_to",pipeType:t=>"select-zone_"+t+"_pipe_type",area:t=>"number-zone_"+t+"_area_m2",spacing:t=>"number-zone_"+t+"_pipe_spacing_mm",ble:t=>"text-zone_"+t+"_ble_mac",name:t=>"text-zone_"+t+"_name",exteriorWalls:t=>"text-zone_"+t+"_exterior_walls",motorTarget:t=>"number-motor_"+t+"_target_position",motorOpenRipples:t=>"sensor-motor_"+t+"_learned_open_ripples",motorCloseRipples:t=>"sensor-motor_"+t+"_learned_close_ripples",motorOpenFactor:t=>"sensor-motor_"+t+"_learned_open_factor",motorCloseFactor:t=>"sensor-motor_"+t+"_learned_close_factor",preheatAdvance:t=>"sensor-zone_"+t+"_preheat_advance_c",motorLastFault:t=>"text_sensor-motor_"+t+"_last_fault",probeTemp:t=>"sensor-probe_"+t+"_temperature",windExposure:t=>"number-zone_"+t+"_wind_exposure",solarGain:t=>"number-zone_"+t+"_solar_gain",thermalLeadH:t=>"number-zone_"+t+"_thermal_lead_h",forecastOffset:t=>"sensor-zone_"+t+"_forecast_offset_c",forecastPeakH:t=>"sensor-zone_"+t+"_forecast_peak_h",staticFactor:t=>"sensor-zone_"+t+"_static_factor",balanceFactor:t=>"sensor-zone_"+t+"_balance_factor",balanceAdapt:t=>"sensor-zone_"+t+"_balance_adapt",adaptErr:t=>"sensor-zone_"+t+"_adapt_err"},n={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFetchEpoch:"sensor-forecast_fetch_epoch",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c",balanceMode:"select-balance_mode",adaptIntervalS:"number-adapt_interval_s",adaptStep:"number-adapt_step",adaptMin:"number-adapt_min",adaptMax:"number-adapt_max",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var re=6,mr=8,to=null,Re=0,tt=1,oo=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],O={temp:new Float32Array(re),setpoint:new Float32Array(re),valve:new Float32Array(re),enabled:new Uint8Array(re),driversEnabled:1,fault:0,manualMode:0};function fr(){O.manualMode=0,Te("manualMode",!1);for(let l=0;l<re;l++){O.temp[l]=20.5+l*.4,O.setpoint[l]=21+l%3*.5,O.valve[l]=12+l*8,O.enabled[l]=l===4?0:1;let g=l+1;x(c.temp(g),{value:O.temp[l]}),x(c.setpoint(g),{value:O.setpoint[l]}),x(c.valve(g),{value:O.valve[l]}),x(c.state(g),{state:O.valve[l]>5?"heating":"idle"}),x(c.enabled(g),{value:!!O.enabled[l],state:O.enabled[l]?"on":"off"}),x(c.probe(g),{state:"Probe "+g}),x(c.tempSource(g),{state:g%2?"Local Probe":"BLE"}),x(c.syncTo(g),{state:"None"}),x(c.pipeType(g),{state:"PEX 16mm"}),x(c.area(g),{value:8+g*3.5}),x(c.spacing(g),{value:[150,200,150,100,200,150][l]}),x(c.ble(g),{state:"AA:BB:CC:DD:EE:0"+g}),x(c.name(g),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][l]||""}),x(c.exteriorWalls(g),{state:["N","E","S","W","N,E","S,W"][l]}),x(c.windExposure(g),{value:[.5,.5,.5,.5,.7,.7][l]}),x(c.solarGain(g),{value:.3}),x(c.thermalLeadH(g),{value:4}),x(c.preheatAdvance(g),{value:.08+l*.03});let d=[.62,.78,1,.55,.88,.7][l],b=[1.08,.95,1,1.15,.9,1.02][l];x(c.staticFactor(g),{value:d}),x(c.balanceAdapt(g),{value:b}),x(c.balanceFactor(g),{value:Math.min(1,d*b)}),x(c.adaptErr(g),{value:[.12,-.05,0,.22,-.1,.03][l]})}for(let l=1;l<=mr;l++){let g=l<=re?l:re,d=O.temp[g-1]+(l>re?1:.1*l);x(c.probeTemp(l),{value:d})}x(n.flow,{value:34.1}),x(n.ret,{value:30.4}),x(n.uptime,{value:18*3600+720}),x(n.wifi,{value:-57}),x(n.drivers,{value:!0,state:"on"}),x(n.fault,{value:!1,state:"off"}),x(n.ip,{state:"192.168.1.86"}),x(n.ssid,{state:"MockLab"}),x(n.mac,{state:"D8:3B:DA:12:34:56"}),x(n.firmware,{state:"0.5.x-mock"}),x(n.manifoldFlowProbe,{state:"Probe 7"}),x(n.manifoldReturnProbe,{state:"Probe 8"}),x(n.manifoldType,{state:"NC (Normally Closed)"}),x(n.motorProfileDefault,{state:"HmIP VdMot"}),x(n.closeThresholdMultiplier,{value:1.7}),x(n.closeSlopeThreshold,{value:1}),x(n.closeSlopeCurrentFactor,{value:1.4}),x(n.openThresholdMultiplier,{value:1.7}),x(n.openSlopeThreshold,{value:.8}),x(n.openSlopeCurrentFactor,{value:1.3}),x(n.openRippleLimitFactor,{value:1}),x(n.genericRuntimeLimitSeconds,{value:45}),x(n.hmipRuntimeLimitSeconds,{value:40}),x(n.relearnAfterMovements,{value:2e3}),x(n.relearnAfterHours,{value:168}),x(n.learnedFactorMinSamples,{value:3}),x(n.learnedFactorMaxDeviationPct,{value:12}),x(n.simplePreheatEnabled,{state:"on"}),x(n.balanceMode,{state:"Adaptive"}),x(n.adaptIntervalS,{value:3600}),x(n.adaptStep,{value:.02}),x(n.adaptMin,{value:.5}),x(n.adaptMax,{value:1.5}),x(n.minZoneFlowPct,{value:15}),x(n.minimumFlowAlways,{state:"off"}),x(n.cpuLoadCore0,{value:18.5}),x(n.cpuLoadCore1,{value:7.2}),x(n.freeInternalKb,{value:142}),x(n.freePsramKb,{value:7800}),Be(!0);let t=300,e=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],a=[];for(let l=0;l<o;l++){let g=(o-1-l)*t,d=e-g,b=Math.floor(l/12)%24,v=r.map(z=>z[b%z.length]),f=g/3600,m=f>2.5&&f<3.5||f>8.5&&f<9.5?1:0,_=v.filter(z=>z===5).length,u=Math.round(Math.min(100,_*15+Math.abs(Math.sin(l/8))*6)),w=Number((30+_*1.4+Math.sin(l/11)*1.5).toFixed(1)),k=Number((w-(1.4+_*.35)).toFixed(1));a.push([d,...v,m,w,k,u])}Ke({interval_s:t,uptime_s:e,count:o,entries:a});let i=[];for(let l=0;l<48;l++){let g=6-3*Math.sin(l/24*Math.PI)-(l>10&&l<20?2:0),d=4+(l>8&&l<18?9*Math.exp(-Math.pow(l-13,2)/12):0)+Math.sin(l/5),b=(220+l*4)%360,v=l%24,f=Math.max(0,Math.round(820*Math.sin((v-6)/12*Math.PI)));i.push([Number(g.toFixed(1)),Number(Math.max(0,d).toFixed(1)),Math.round(b),f])}let s=new Date(e*1e3);s.setHours(0,0,0,0);let p=Math.floor(s.getTime()/1e3);Qe({base_epoch:p,age_s:480,fetch_epoch:e-480,count:48,hours:i}),ro(6)}function ro(t){let e=[];for(let o=0;o<t;o++){let r=oo[tt%oo.length];e.push([tt,r[0],r[1],r[2]]),tt++}Je(e,tt)}function br(){Re+=1,x(n.uptime,{value:Number(Date.now()/1e3)|0}),x(n.wifi,{value:-55-Math.round((1+Math.sin(Re/4))*6)});let t=0,e=0,o=0;for(let s=0;s<re;s++){let p=s+1,l=!!O.enabled[s],g=O.temp[s],d=O.setpoint[s],b=l&&O.driversEnabled&&!O.manualMode&&g<d-.25;O.manualMode?O.valve[s]=Math.max(0,O.valve[s]):!l||!O.driversEnabled?O.valve[s]=Math.max(0,O.valve[s]-6):b?O.valve[s]=Math.min(100,O.valve[s]+7+p%3):O.valve[s]=Math.max(0,O.valve[s]-5);let v=b?.05+O.valve[s]/2200:-.03+O.valve[s]/3200;O.temp[s]=g+v+Math.sin((Re+p)/5)*.04,l&&O.valve[s]>0&&(t+=O.valve[s],e+=1,o=Math.max(o,O.valve[s])),x(c.temp(p),{value:O.temp[s]}),x(c.valve(p),{value:Math.round(O.valve[s])});let f=Math.max(0,(O.setpoint[s]-O.temp[s]-.15)*.22);x(c.preheatAdvance(p),{value:Number(f.toFixed(2))}),x(c.state(p),{state:l?b?"heating":"idle":"off"}),x(c.enabled(p),{value:l,state:l?"on":"off"}),x(c.probeTemp(p),{value:O.temp[s]+Math.sin((Re+p)/6)*.1})}let r=29.5+o*.075+e*.18+Math.sin(Re/6)*.25,a=r-(e?2.1+t/Math.max(1,e*50):1.1);x(n.flow,{value:Number(r.toFixed(1))}),x(n.ret,{value:Number(a.toFixed(1))}),x(c.probeTemp(7),{value:Number((a-.4).toFixed(1))}),x(c.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Be(!0);let i=B("zoneStateHistory");i&&(i.uptime_s=Number(Date.now()/1e3)|0),Re%3===0&&ro(1)}function ao(){to||(fr(),De(!0),to=setInterval(br,1200))}function ot(t){var i;let e=t.key||"",o=t.value,r=t.zone||0;if(e==="zone_setpoint"&&r>=1&&r<=re){let s=Number(o);Number.isNaN(s)||(O.setpoint[r-1]=s,x(c.setpoint(r),{value:s}),P("Zone "+r+" setpoint set to "+s.toFixed(1)+"\xB0C",r));return}if(e==="zone_enabled"&&r>=1&&r<=re){let s=o>.5;O.enabled[r-1]=s?1:0,x(c.enabled(r),{value:s,state:s?"on":"off"}),P("Zone "+r+(s?" enabled":" disabled"),r);return}if(e==="drivers_enabled"){let s=o>.5;O.driversEnabled=s?1:0,x(n.drivers,{value:s,state:s?"on":"off"}),P(s?"Motor drivers enabled":"Motor drivers disabled");return}if(e==="manual_mode"){let s=o>.5;O.manualMode=s?1:0,Te("manualMode",s);return}if(e==="motor_target"&&r>=1&&r<=re){let s=Number(o||0);x(c.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(s)))}),P("Motor "+r+" target set to "+s+"%",r);return}if(e==="command"){let s=String(o);if(s==="i2c_scan"){Pe(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),P("I2C scan complete");return}if(s==="calibrate_all_motors"||s==="restart"){P("Command executed: "+s);return}if(s==="open_motor_timed"&&r>=1&&r<=re){P("Motor "+r+" open timed",r);return}if(s==="close_motor_timed"&&r>=1&&r<=re){P("Motor "+r+" close timed",r);return}if(s==="stop_motor"&&r>=1&&r<=re){P("Motor "+r+" stopped",r);return}if(s==="motor_reset_fault"&&r>=1&&r<=re){P("Motor "+r+" fault reset",r);return}if(s==="motor_reset_learned_factors"&&r>=1&&r<=re){P("Motor "+r+" learned factors reset",r);return}if(s==="motor_reset_and_relearn"&&r>=1&&r<=re){P("Motor "+r+" reset and relearn started",r);return}if(s==="dump_task_stats"){P("Task stats dumped to device log (mock)");return}if(s==="reset_balancing"){for(let p=1;p<=re;p++)x(c.balanceAdapt(p),{value:1}),x(c.balanceFactor(p),{value:(i=L(c.staticFactor(p)))!=null?i:1}),x(c.adaptErr(p),{value:null});P("Adaptive balancing reset");return}return}if(e==="zone_probe"&&r>=1){x(c.probe(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_temp_source"&&r>=1){x(c.tempSource(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_sync_to"&&r>=1){x(c.syncTo(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_pipe_type"&&r>=1){x(c.pipeType(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="manifold_type"){x(n.manifoldType,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="manifold_flow_probe"){x(n.manifoldFlowProbe,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="manifold_return_probe"){x(n.manifoldReturnProbe,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="motor_profile_default"){x(n.motorProfileDefault,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="simple_preheat_enabled"){x(n.simplePreheatEnabled,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="minimum_flow_always"){x(n.minimumFlowAlways,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="balance_mode"){x(n.balanceMode,{state:String(o)}),P("Setting updated: "+e+" = "+o);return}if(e==="zone_name"&&r>=1){x(c.name(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_ble_mac"&&r>=1){x(c.ble(r),{state:String(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_exterior_walls"&&r>=1){let s=String(o)||"None";x(c.exteriorWalls(r),{state:s});let p=s==="None"?0:s.split(",").filter(Boolean).length,l=[0,.5,.7,.85,1][Math.min(p,4)];x(c.windExposure(r),{value:l}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_area_m2"&&r>=1){x(c.area(r),{value:Number(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_pipe_spacing_mm"&&r>=1){x(c.spacing(r),{value:Number(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_wind_exposure"&&r>=1){x(c.windExposure(r),{value:Number(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_solar_gain"&&r>=1){x(c.solarGain(r),{value:Number(o)}),P("Setting updated: "+e+" = "+o,r);return}if(e==="zone_thermal_lead_h"&&r>=1){x(c.thermalLeadH(r),{value:Number(o)}),P("Setting updated: "+e+" = "+o,r);return}let a={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct,adapt_interval_s:n.adaptIntervalS,adapt_step:n.adaptStep,adapt_min:n.adaptMin,adapt_max:n.adaptMax,min_zone_flow_pct:n.minZoneFlowPct};if(a[e]){let s=Number(o);Number.isNaN(s)||(x(a[e],{value:s}),P("Setting updated: "+e+" = "+o));return}}window.__hv6_mock={setSetpoint(t,e){ot({key:"zone_setpoint",value:e,zone:t})},toggleZone(t){let e=!O.enabled[t-1];ot({key:"zone_enabled",value:e?1:0,zone:t})}};var rt="/api/hv6/v1";function at(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function ge(t,e,o){if(Yt(),at())try{return ot(o),Promise.resolve({ok:!0})}finally{kt()}let r=new URLSearchParams;for(let[s,p]of Object.entries(e||{}))p!=null&&r.append(s,p);let a=r.toString(),i=rt+t+(a?"?"+a:"");return fetch(i,{method:"POST"}).then(s=>(s.ok||console.warn(`API call failed: POST ${t} status=${s.status}`),s)).catch(s=>{throw console.error(`API call error: POST ${t}:`,s),s}).finally(()=>{kt()})}function Lt(t,e){return x(c.setpoint(t),{value:e}),ge(`/zones/${t}/setpoint`,{setpoint_c:e},{key:"zone_setpoint",value:e,zone:t})}function no(t,e){return x(c.enabled(t),{state:e?"on":"off",value:e}),ge(`/zones/${t}/enabled`,{enabled:!!e},{key:"zone_enabled",value:e?1:0,zone:t})}function so(t){return x(n.drivers,{state:t?"on":"off",value:t}),ge("/drivers/enabled",{enabled:!!t},{key:"drivers_enabled",value:t?1:0})}function ve(t,e){return ge("/commands",{command:t,zone:e||void 0},{key:"command",value:t,zone:e||void 0})}function io(){return Pe("Scanning I2C bus..."),P("I2C scan started"),ve("i2c_scan")}var hr={zone_probe:t=>c.probe(t),zone_temp_source:t=>c.tempSource(t),zone_sync_to:t=>c.syncTo(t),zone_pipe_type:t=>c.pipeType(t)},vr={zone_ble_mac:t=>c.ble(t),zone_exterior_walls:t=>c.exteriorWalls(t),zone_name:t=>c.name(t)},xr={zone_area_m2:t=>c.area(t),zone_pipe_spacing_mm:t=>c.spacing(t)},yr={manifold_type:n.manifoldType,manifold_flow_probe:n.manifoldFlowProbe,manifold_return_probe:n.manifoldReturnProbe,motor_profile_default:n.motorProfileDefault,simple_preheat_enabled:n.simplePreheatEnabled,balance_mode:n.balanceMode},wr={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct,adapt_interval_s:n.adaptIntervalS,adapt_step:n.adaptStep,adapt_min:n.adaptMin,adapt_max:n.adaptMax};function Oe(t,e,o){let r=hr[e];return r&&x(r(t),{state:o}),ge("/settings/select",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function We(t,e,o){let r=vr[e];return r&&x(r(t),{state:o}),ge("/settings/text",{key:e,value:o,zone:t},{key:e,value:o,zone:t})}function He(t,e,o){let r=Number(o),a=xr[e];return a&&!Number.isNaN(r)&&x(a(t),{value:r}),ge("/settings/number",{key:e,value:r,zone:t},{key:e,value:r,zone:t})}function ce(t,e){let o=yr[t];return o&&x(o,{state:e}),ge("/settings/select",{key:t,value:e},{key:t,value:e})}function de(t,e){let o=Number(e),r=wr[t];return r&&!Number.isNaN(o)&&x(r,{value:o}),ge("/settings/number",{key:t,value:o},{key:t,value:o})}function lo(t,e){return ge("/settings/text",{key:t,value:e},{key:t,value:e})}function co(t,e){let o=String(e||"").trim();return P("Zone "+t+" renamed to "+(o||"(blank)"),t),We(t,"zone_name",o)}function po(t,e){let o=Number(e),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return x(c.motorTarget(t),{value:r}),P("Motor "+t+" target set to "+r+"%",t),ge(`/motors/${t}/target`,{value:r},{key:"motor_target",value:r,zone:t})}function uo(t,e=1e4){return P("Motor "+t+" open for "+e+"ms",t),ge(`/motors/${t}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:t})}function go(t,e=1e4){return P("Motor "+t+" close for "+e+"ms",t),ge(`/motors/${t}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:t})}function Ct(t){return P("Motor "+t+" stopped",t),ge(`/motors/${t}/stop`,{},{key:"command",value:"stop_motor",zone:t})}function Ft(t){return Te("manualMode",!!t),P(t?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),ge("/manual_mode",{enabled:!!t},{key:"manual_mode",value:t?1:0})}function mo(t){return P("Motor "+t+" fault reset",t),ve("motor_reset_fault",t)}function fo(t){return P("Motor "+t+" learned factors reset",t),ve("motor_reset_learned_factors",t)}function bo(t){return P("Motor "+t+" reset and relearn started",t),ve("motor_reset_and_relearn",t)}function ho(){return P("Adaptive balancing reset \u2014 learned factors back to 1.0"),ve("reset_balancing")}function vo(){return P("Task stats dumped to device log"),ve("dump_task_stats")}function Mt(){at()||fetch(rt+"/history",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Ke(t)}).catch(()=>{})}function At(){if(at())return;let t=Jt();fetch(rt+"/logs?since="+t,{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Je(e.lines,e.next_seq)}).catch(()=>{})}function Ze(){at()||fetch(rt+"/forecast",{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Qe(t)}).catch(()=>{})}var Et=null,nt=null,xo=null,yo=null,wo=null;async function zr(){nt&&nt.abort(),nt=new AbortController;let t=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:nt.signal});if(t.status===503)throw new Error("State fetch busy");if(!t.ok)throw new Error("State fetch failed: "+t.status);return t.json()}function zo(t){if(!(!t||typeof t!="object")&&!Kt()){for(let e in t)x(e,t[e]);Be(!1)}}function Sr(t){if(t){if(!t.type){zo(t);return}if(t.type==="state"){zo(t.data);return}if(t.type==="log"){let e=t.data&&(t.data.message||t.data.msg||t.data.text||"");if(!e)return;P(e),String(e).indexOf("I2C_SCAN:")!==-1&&Pe(String(e))}}}function So(){Et||(Et=setTimeout(()=>{Et=null,Nt()},1e3))}function Nt(){let t=window.HV6_DASHBOARD_CONFIG;if(t&&t.mock){ao();return}zr().then(e=>{De(!0),Sr(e),Mt(),xo||(xo=setInterval(Mt,300*1e3)),At(),yo||(yo=setInterval(At,3e3)),Ze(),wo||(wo=setInterval(Ze,3600*1e3)),So()}).catch(()=>{De(!1),So()})}var _o=Object.create(null);function A(t,e){if(_o[t])return;_o[t]=1;let o=document.createElement("style");o.textContent=e,document.head.appendChild(o)}var st={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.waiting":"Waiting for device logs...","footer.product":"HEATVALVE-6 \xB7 UFH CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","settings.group.installation":"Installation","settings.group.heatSource":"Heat Source","settings.group.weather":"Weather Preload","settings.group.motorAdvanced":"Motor Advanced","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manual Motor Control","diagnostics.group.health":"Device Health","diagnostics.group.learning":"Learning & Balance","diagnostics.group.actions":"Service Actions","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers.forecast":"Forecast chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.weather.title":"Weather Forecast","overview.weather.notFetched":"No forecast fetched yet. Enable Forecast Preload in Settings and check the location.","overview.weather.updated":"Updated {time}","overview.weather.windArrows":"Wind direction arrows","overview.weather.tooltip.from":"From","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.timeline.expectedState":"Expected state","overview.timeline.weatherPreload":"Weather preload","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature Sensors / Connectivity","zone.sensor.returnSensor":"Zone Return Temperature Sensor","zone.sensor.tempSource":"Temperature Source","zone.sensor.bleSensor":"BLE Sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone Settings","zone.room.friendlyName":"Friendly Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.room.area":"Zone Area (m\xB2)","zone.room.spacing":"Pipe Spacing C-C (mm)","zone.room.pipeType":"Pipe Type","zone.room.exteriorWalls":"Exterior Walls","zone.room.selectAll":"Select all that apply","zone.room.forecastPreload":"Forecast Preload","zone.room.windExposure":"Wind Exposure","zone.room.solarGain":"Solar Gain","zone.room.thermalLead":"Thermal Lead (h)","zone.room.note":"Wind exposure (0-1) is auto-seeded from the exterior walls above - edit it for a sheltered or extra-exposed site. Solar (0-1) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual floor for a modulating heat source, independent of the bridge","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.minFlow.title":"Minimum Zone Flow","settings.minFlow.help":"Keeps a manual minimum valve opening on enabled zones while active, giving a modulating heat source a stable flow floor.","settings.minFlow.enabledSub":"manual floor for a modulating heat source, independent of the bridge","settings.minFlow.opening":"Min valve opening (%)","settings.minFlow.openingSub":"floor held on every enabled zone while active","settings.asgard.title":"Modulating Heat Source","settings.asgard.help":"Pushes the house-weighted room temperature to a modulating heat-source controller. One board is the coordinator and aggregates zones from both boards; the other is a slave.","settings.asgard.bridgeEnabled":"Bridge enabled","settings.asgard.bridgeSub":"send weighted house temperature to the heat-source controller","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"pushes to the heat source","settings.asgard.endpoint":"Heat Source Endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for the weighted house temp","settings.asgard.peerBoard":"Peer board","settings.asgard.peerHost":"Peer host","settings.asgard.peerPlaceholder":"empty = single board","settings.asgard.pushInterval":"Push interval (s)","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.advanced":"Advanced motor learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.forecast.title":"Forecast Preload","settings.forecast.help":"Charges the slab before incoming weather: raises a zone setpoint when forecast wind on its exterior walls is about to spike. Solar gain offsets it. Fetched from Open-Meteo hourly.","settings.forecast.fetchNow":"Fetch Now","settings.forecast.fetching":"Fetching...","settings.forecast.lastFetch":"Last fetch: {time}","settings.forecast.windEnabled":"Wind preload enabled","settings.forecast.toggle":"Toggle forecast preload","settings.forecast.note":"Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.","settings.forecast.location":"Location","settings.forecast.latitude":"Latitude","settings.forecast.longitude":"Longitude","settings.forecast.model":"Model","settings.forecast.loadThreshold":"Load threshold","settings.forecast.maxOffset":"Max offset (\xB0C)","settings.balancing.title":"Hydraulic Balancing","settings.balancing.help":"Scales raw valve positions by pipe length and zone area so long loops get proportionally more flow. Adaptive mode tunes the factors over time.","settings.balancing.mode":"Balancing mode","settings.balancing.static":"Static","settings.balancing.adaptive":"Adaptive","settings.balancing.note":"Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top - no return probes - nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.","settings.balancing.tuning":"Adaptive tuning","settings.balancing.interval":"Update interval (s)","settings.balancing.step":"Step (k)","settings.balancing.minFactor":"Min factor","settings.balancing.maxFactor":"Max factor","settings.balancing.reset":"Reset balancing","settings.balancing.resetNote":"Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.asgard.title":"Bridge Status","diagnostics.asgard.setpointNote":"Recommended virtual thermostat setpoint, derived from enabled zone targets.","diagnostics.asgard.peer":"Peer","diagnostics.asgard.lastPush":"Last push","diagnostics.asgard.zonesWeighted":"Zones weighted","diagnostics.asgard.lastError":"Last error","diagnostics.asgard.ageSeconds":"{value}s ago","diagnostics.asgard.ageMinutes":"{value}m ago","diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Faults & Relearn","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Reset Fault","diagnostics.recovery.resetFactors":"Reset Factors","diagnostics.recovery.resetRelearn":"Reset + Relearn","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.preheatFactors.title":"Preheat Factors","diagnostics.preheatFactors.note":"Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat.","diagnostics.forecastPreload.title":"Forecast Preload Status","diagnostics.forecastPreload.zone":"Zone","diagnostics.forecastPreload.activeOffset":"Active offset","diagnostics.forecastPreload.note":"Live forecast preload offset applied to each zone right now. The hours-ahead figure shows when the forecast load peak is expected.","diagnostics.balancing.title":"Balancing Status","diagnostics.balancing.prior":"Prior","diagnostics.balancing.learned":"Learned","diagnostics.balancing.effective":"Effective","diagnostics.balancing.error":"Error","diagnostics.balancing.note":"Prior = static design factor. Learned = adaptive multiplier. Effective = prior times learned. Error is the long-window setpoint-room average used to boost cold loops and throttle warm loops."},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"HEATVALVE-6 \xB7 UFH-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","settings.group.installation":"Installation","settings.group.heatSource":"Varmekilde","settings.group.weather":"Vejr-preload","settings.group.motorAdvanced":"Motor avanceret","diagnostics.group.logs":"Logs","diagnostics.group.manual":"Manuel motorstyring","diagnostics.group.health":"Enhedens helbred","diagnostics.group.learning":"L\xE6ring & balancering","diagnostics.group.actions":"Servicehandlinger","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers.forecast":"Forecast-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.weather.title":"Vejrudsigt","overview.weather.notFetched":"Ingen forecast hentet endnu. Aktiver Forecast Preload i Indstillinger, og kontroller placeringen.","overview.weather.updated":"Opdateret {time}","overview.weather.windArrows":"Vindretning pile","overview.weather.tooltip.from":"Fra","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.timeline.expectedState":"Forventet tilstand","overview.timeline.weatherPreload":"Vejr-preload","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatursensorer / Forbindelse","zone.sensor.returnSensor":"Zone returtemperatursensor","zone.sensor.tempSource":"Temperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneindstillinger","zone.room.friendlyName":"Venligt navn","zone.room.friendlyPlaceholder":"fx Stue","zone.room.area":"Zoneareal (m\xB2)","zone.room.spacing":"R\xF8rafstand C-C (mm)","zone.room.pipeType":"R\xF8rtype","zone.room.exteriorWalls":"Yderv\xE6gge","zone.room.selectAll":"V\xE6lg alle relevante","zone.room.forecastPreload":"Forecast preload","zone.room.windExposure":"Vindeksponering","zone.room.solarGain":"Solindfald","zone.room.thermalLead":"Termisk lead (t)","zone.room.note":"Vindeksponering (0-1) auto-seedes fra yderv\xE6ggene ovenfor - juster den for l\xE6 eller ekstra udsat placering. Sol (0-1) er passivt solindfald, der reducerer preload; lead t er hvor tidligt pladen skal lades f\xF8r en forecast kulde-/vindtop.","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow for modulerende varmekilde, uafh\xE6ngigt af bridge","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.minFlow.title":"Minimum zoneflow","settings.minFlow.help":"Holder en manuel minimumsventil\xE5bning p\xE5 aktive zoner mens funktionen er aktiv, s\xE5 en modulerende varmekilde har et stabilt flowgulv.","settings.minFlow.enabledSub":"manuel minimumsflow for modulerende varmekilde, uafh\xE6ngigt af bridge","settings.minFlow.opening":"Min ventil\xE5bning (%)","settings.minFlow.openingSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.asgard.title":"Modulerende varmekilde","settings.asgard.help":"Sender husets v\xE6gtede rumtemperatur til en modulerende varmekilde-controller. \xC9t board er coordinator og samler zoner fra begge boards; det andet er slave.","settings.asgard.bridgeEnabled":"Bridge aktiveret","settings.asgard.bridgeSub":"send v\xE6gtet hustemperatur til varmekilde-controlleren","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"sender til varmekilden","settings.asgard.endpoint":"Varmekilde endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for v\xE6gtet hustemp","settings.asgard.peerBoard":"Peer-board","settings.asgard.peerHost":"Peer-host","settings.asgard.peerPlaceholder":"tom = enkelt board","settings.asgard.pushInterval":"Push-interval (s)","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.advanced":"Avanceret motorl\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.forecast.title":"Forecast preload","settings.forecast.help":"Lader pladen f\xF8r indkommende vejr: h\xE6ver zone-setpunkt n\xE5r forecast vind p\xE5 yderv\xE6gge snart topper. Solindfald modregner. Hentes fra Open-Meteo timevis.","settings.forecast.fetchNow":"Hent nu","settings.forecast.fetching":"Henter...","settings.forecast.lastFetch":"Senest hentet: {time}","settings.forecast.windEnabled":"Vind-preload aktiveret","settings.forecast.toggle":"Skift forecast preload","settings.forecast.note":"Lader pladen f\xF8r en kommende storm: h\xE6ver zonens setpunkt n\xE5r forecast vind p\xE5 yderv\xE6ggene snart topper. Det hentede forecast vises p\xE5 Monitor-siden.","settings.forecast.location":"Placering","settings.forecast.latitude":"Breddegrad","settings.forecast.longitude":"L\xE6ngdegrad","settings.forecast.model":"Model","settings.forecast.loadThreshold":"Load-t\xE6rskel","settings.forecast.maxOffset":"Maks offset (\xB0C)","settings.balancing.title":"Hydraulisk balancering","settings.balancing.help":"Skalerer r\xE5 ventilpositioner efter r\xF8rl\xE6ngde og zoneareal, s\xE5 lange sl\xF8jfer f\xE5r proportionalt mere flow. Adaptive mode tuner faktorerne over tid.","settings.balancing.mode":"Balanceringsmode","settings.balancing.static":"Statisk","settings.balancing.adaptive":"Adaptiv","settings.balancing.note":"Statisk fordeler flow fra den modstandsbaserede designmodel (areal, r\xF8r, gulv). Adaptiv l\xE6gger en langsom rumtemperatur-korrektion ovenp\xE5 - uden returprober - og nudger kronisk kolde sl\xF8jfer \xE5bne og overforsynede sl\xF8jfer lukkede over dage. Den omfordeler kun flow mellem sl\xF8jfer og h\xE6ver aldrig samlet behov.","settings.balancing.tuning":"Adaptiv tuning","settings.balancing.interval":"Opdateringsinterval (s)","settings.balancing.step":"Step (k)","settings.balancing.minFactor":"Min faktor","settings.balancing.maxFactor":"Maks faktor","settings.balancing.reset":"Nulstil balancering","settings.balancing.resetNote":"Reset rydder alle sl\xF8jfers l\xE6rte multiplier tilbage til 1.0 (genl\xE6res over dage). Step begr\xE6nser bev\xE6gelsen pr. opdatering; konvergens er bevidst langsom for at matche pladens termiske tr\xE6ghed.","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.asgard.title":"Bridge-status","diagnostics.asgard.setpointNote":"Anbefalet virtuelt termostat-setpunkt, beregnet fra aktive zoners m\xE5l.","diagnostics.asgard.peer":"Peer","diagnostics.asgard.lastPush":"Seneste push","diagnostics.asgard.zonesWeighted":"V\xE6gtede zoner","diagnostics.asgard.lastError":"Seneste fejl","diagnostics.asgard.ageSeconds":"{value}s siden","diagnostics.asgard.ageMinutes":"{value}m siden","diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Fejl & genl\xE6ring","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Nulstil fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer","diagnostics.recovery.resetRelearn":"Nulstil + genl\xE6r","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.preheatFactors.title":"Preheat-faktorer","diagnostics.preheatFactors.note":"L\xE6rt simple-preheat forspring pr. zone. Styringen k\xF8rer automatisk; disse v\xE6rdier viser hvor meget tidligere hvert rum begynder at kalde p\xE5 varme.","diagnostics.forecastPreload.title":"Forecast preload-status","diagnostics.forecastPreload.zone":"Zone","diagnostics.forecastPreload.activeOffset":"Aktiv offset","diagnostics.forecastPreload.note":"Live forecast-preload offset anvendt p\xE5 hver zone lige nu. Timer-frem tallet viser hvorn\xE5r forecast load-toppen ventes.","diagnostics.balancing.title":"Balanceringsstatus","diagnostics.balancing.prior":"Prior","diagnostics.balancing.learned":"L\xE6rt","diagnostics.balancing.effective":"Effektiv","diagnostics.balancing.error":"Fejl","diagnostics.balancing.note":"Prior = statisk designfaktor. L\xE6rt = adaptiv multiplier. Effektiv = prior gange l\xE6rt. Fejl er langtidsvindue setpunkt-rumgennemsnit, der bruges til at booste kolde sl\xF8jfer og drosle varme sl\xF8jfer."}},ko="en".toLowerCase(),Tt=st[ko]?ko:"en";function y(t,e){let o=st[Tt]&&st[Tt][t]||st.en[t]||t;return e?String(o).replace(/\{(\w+)\}/g,(r,a)=>e[a]==null?"":String(e[a])):o}function C(t){t&&(t.querySelectorAll("[data-i18n]").forEach(e=>{e.textContent=y(e.getAttribute("data-i18n"))}),t.querySelectorAll("[data-i18n-title]").forEach(e=>{e.setAttribute("title",y(e.getAttribute("data-i18n-title")))}),t.querySelectorAll("[data-i18n-label]").forEach(e=>{e.setAttribute("aria-label",y(e.getAttribute("data-i18n-label")))}),t.querySelectorAll("[data-i18n-placeholder]").forEach(e=>{e.setAttribute("placeholder",y(e.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Tt);var _r=`
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
  font-family: var(--font-display);
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
  overflow: visible;
}
.ui-title-text { display: inline-flex; align-items: center; }

/* ---- Help badge: a "?" chip with a hover/focus explanation tooltip ---- */
.help-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  margin-left: 7px;
  border-radius: 999px;
  border: 1.5px solid var(--control-border-strong);
  color: var(--text-secondary);
  font-size: .65rem;
  font-weight: 700;
  font-family: inherit;
  text-transform: none;
  letter-spacing: 0;
  cursor: help;
  position: relative;
  flex-shrink: 0;
  vertical-align: middle;
}
.help-badge:hover, .help-badge:focus-visible { color: var(--accent); border-color: var(--accent); outline: none; }
.help-badge .help-tip {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: max-content;
  max-width: 240px;
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: .72rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: .2px;
  text-align: left;
  white-space: normal;
  box-shadow: var(--panel-shadow);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

.ui-section {
  font-family: var(--font-display);
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
  border-bottom: 1px solid var(--divider);
}
.ui-row:last-child { border-bottom: none; }

.ui-label {
  color: var(--text);
  font-size: .96rem;
  font-weight: 600;
  line-height: 1.22;
  min-width: 0;
}
.ui-sublabel {
  display: block;
  color: var(--text-faint);
  font-size: .78rem;
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
  font-size: .92rem;
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
  font-size: .92rem;
  transition: border-color .15s ease;
}

.ui-input:focus,
.ui-select:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
}

.ui-unit { color: var(--text-faint); font-size: .78rem; font-weight: 600; }

/* ---- Numeric stepper (\u2212 value +) ----
   The value reads as plain text (flat, no input chrome) between the buttons;
   double-clicking it reveals the editable input. */
.ui-stepper { display: inline-flex; align-items: center; gap: 6px; }
.ui-stepper .ui-input {
  width: 54px;
  text-align: center;
  border-color: transparent;
  background: transparent;
  color: var(--accent);
  font-size: 1.04rem;
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
  background: var(--warn-bg-soft);
  border: 1px solid var(--warn-border);
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
.ui-form-apply { background: var(--accent); color: var(--text-on-accent); border-color: var(--accent); }
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
  background: var(--control-knob);
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: var(--success-bg-soft); border-color: var(--success-border); }
.ui-toggle.on::after { transform: translateX(22px); background: var(--text-on-accent); }

/* ---- Notes & dividers ---- */
.ui-note {
  color: var(--text-secondary);
  font-size: .82rem;
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
.ui-btn:hover { background: var(--control-bg-hover); border-color: var(--control-border-hover); }
.ui-btn.warn { border-color: var(--danger-border); background: var(--danger-bg); color: var(--danger-text); }
.ui-btn.warn:hover { background: var(--danger-bg-strong); border-color: var(--danger-border-strong); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;A("ui-kit",_r);function fe(t){let e=y(t);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(e).replace(/"/g,"&quot;")}" data-i18n-label="${t}">?<span class="help-tip" data-i18n="${t}">${e}</span></span>`}function kr(t,e){let o=Math.abs(Number(t));return!Number.isFinite(o)||o<1e3?e:Math.pow(10,Math.floor(Math.log10(o))-1)}function Lr(t){let e=String(t),o=e.indexOf(".");return o<0?0:e.length-o-1}function ae(t,e={}){let o=t.querySelector(e.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):t.insertAdjacentElement("afterbegin",r);let a=[],i=()=>r.classList.toggle("show",a.some(u=>u.dirty)),s=(u,w)=>{u.dirty=w,i()};function p(u){return u.markDirty=()=>s(u,!0),a.push(u),u}function l(u,w){let k={dirty:!1,input:u},z=w.baseStep!=null?w.baseStep:parseFloat(u.step)||1,h=Lr(z),E=w.min!=null?w.min:u.min!==""?parseFloat(u.min):-1/0,H=w.max!=null?w.max:u.max!==""?parseFloat(u.max):1/0,G=$=>h>0?Number($).toFixed(h):String(Math.round(Number($)));if(!w.nostep){let $=document.createElement("div");$.className="ui-stepper",u.parentNode.insertBefore($,u);let F=document.createElement("button");F.type="button",F.className="ui-step-btn",F.textContent="\u2212",F.tabIndex=-1,F.setAttribute("aria-label",y("common.decrease"));let N=document.createElement("button");N.type="button",N.className="ui-step-btn",N.textContent="+",N.tabIndex=-1,N.setAttribute("aria-label",y("common.increase")),$.appendChild(F),$.appendChild(u),$.appendChild(N),u.readOnly=!0;let M=W=>{if(u.disabled)return;let J=parseFloat(u.value);Number.isFinite(J)||(J=parseFloat(u.placeholder)),Number.isFinite(J)||(J=0);let se=Math.min(H,Math.max(E,J+W*kr(J,z)));u.value=G(se),s(k,!0)};F.addEventListener("click",()=>M(-1)),N.addEventListener("click",()=>M(1)),u.addEventListener("dblclick",()=>{u.disabled||(u.readOnly=!1,u.classList.add("editing"),u.focus(),u.select())}),u.addEventListener("blur",()=>{u.readOnly=!0,u.classList.remove("editing")}),u.addEventListener("keydown",W=>{W.key==="Enter"&&u.blur()})}return u.addEventListener("input",()=>s(k,!0)),k.sync=()=>{let $=w.read();u.value=$!=null&&Number.isFinite(Number($))?G($):""},k.commit=()=>{let $=parseFloat(u.value);Number.isFinite($)&&w.commit(Math.min(H,Math.max(E,$)))},p(k)}function g(u,w){let k={dirty:!1,input:u};return u.addEventListener("input",()=>s(k,!0)),k.sync=()=>{let z=w.read();u.value=z!=null?z:""},k.commit=()=>w.commit(u.value.trim()),p(k)}function d(u,w){let k={dirty:!1,input:u};return u.addEventListener("change",()=>s(k,!0)),k.sync=()=>{let z=w.read();z!=null&&(u.value=z)},k.commit=()=>w.commit(u.value),p(k)}function b(u,w){let k={dirty:!1,input:u,staged:!1},z=u.closest(".ui-row"),h=()=>{u.classList.toggle("on",k.staged),z&&z.classList.toggle("is-on",k.staged),u.setAttribute("aria-checked",k.staged?"true":"false"),w.onChange&&w.onChange(k.staged)};return u.addEventListener("click",()=>{k.staged=!k.staged,s(k,!0),h()}),k.sync=()=>{k.staged=!!w.read(),h()},k.commit=()=>w.commit(k.staged),p(k)}function v(u){let w={dirty:!1,sync:u.sync,commit:u.commit};return p(w)}let f=()=>a.forEach(u=>{!u.dirty&&u.sync&&u.sync()}),m=()=>{a.forEach(u=>{u.dirty&&(u.commit&&u.commit(),u.dirty=!1)}),i(),e.onApply&&e.onApply()},_=()=>{a.forEach(u=>{u.dirty=!1,u.sync&&u.sync()}),i(),e.onDiscard&&e.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",m),r.querySelector(".ui-form-discard").addEventListener("click",_),C(r),{num:l,text:g,select:d,toggle:b,custom:v,refresh:f,apply:m,discard:_,isDirty:()=>a.some(u=>u.dirty)}}function be(t){return t!=null&&!isNaN(t)?Math.round(t*10)/10+"\xB0C":"---"}function it(t){return t!=null&&!isNaN(t)?(t|0)+"%":"---"}function lt(t){if(!t||isNaN(t))return"---";t=t|0;var e=t/86400|0,o=t%86400/3600|0,r=t%3600/60|0;return e>0?e+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function Lo(t){return t==null||isNaN(t)?"---":(t=t|0,t>-50?t+" dBm \u2590\u2590\u2590\u2590":t>-60?t+" dBm \u2590\u2590\u2590\u2591":t>-70?t+" dBm \u2590\u2590\u2591\u2591":t>-80?t+" dBm \u2590\u2591\u2591\u2591":t+" dBm \u2591\u2591\u2591\u2591")}function Co(t){if(t==null||isNaN(t))return"hh:mm";let e=Math.round(Date.now()/1e3-t),o=new Date(e*1e3),r=a=>String(a).padStart(2,"0");return`${r(o.getHours())}:${r(o.getMinutes())}`}var Cr=`
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
  align-items: center;
  justify-content: center;
  justify-self: center;
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

.top-menu {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 7px;
}

.menu-link {
  text-decoration: none;
  color: var(--text-secondary);
  border: 1px solid var(--control-border);
  background: var(--control-bg);
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
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
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
  border: 1px solid var(--control-border);
  background: var(--control-bg);
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

.meta-chip-values {
  display: flex;
  gap: 8px;
  align-items: center;
}

.meta-chip-state.synced {
  color: var(--state-ok);
  border-color: var(--success-border-soft);
  background: var(--success-bg);
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: var(--accent-border);
  background: var(--warn-bg-soft);
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: var(--panel-border-soft);
  background: var(--control-bg);
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
  background: var(--state-ok);
  box-shadow: 0 0 12px var(--success-border);
}

@media (max-width: 860px) {
  .topbar-head { grid-template-columns: 1fr; }
  /* Stat pills (uptime / wifi / heat source) ride to the very top, above brand + menu. */
  .top-meta { order: -2; justify-items: center; }
  .top-brand { order: -1; justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;A("hv6-header",Cr);var Fr=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview" data-i18n="nav.monitor">Monitor</a>
        <a href="#" class="menu-link" data-section="zones" data-i18n="nav.zones">Zones</a>
        <a href="#" class="menu-link" data-section="settings" data-i18n="nav.settings">Settings</a>
        <a href="#" class="menu-link" data-section="diagnostics" data-i18n="nav.diagnostics">Diagnostics</a>
      </nav>
      <div class="top-brand">
        <div class="brand-row">
          <div class="side-brand">HeatValve-6</div>
        </div>
        <span class="brand-fw" id="hdr-fw"></span>
      </div>
      <div class="top-meta">
        <div class="meta-row">
          <div class="top-dot" id="hdr-dot"></div>
          <span id="hdr-sync" class="meta-chip meta-chip-state synced">Synced</span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.uptime">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label" data-i18n="meta.wifi">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
          <span class="meta-chip" id="hdr-asgard" hidden>
            <span class="meta-chip-label" data-i18n="meta.heatSourceLastPush">Heat Src Last Push</span>
            <span class="meta-chip-values"><span class="meta-chip-value" id="hdr-asgard-val">---</span><span class="meta-chip-value" id="hdr-asgard-time">--:--</span></span>
          </span>
        </div>
      </div>
    </div>
  </header>
`,ds=T({tag:"hv6-header",render:Fr,onMount(t,e){let o=e.querySelector("#hdr-dot"),r=e.querySelector("#hdr-sync"),a=e.querySelector("#hdr-up"),i=e.querySelector("#hdr-wifi"),s=e.querySelector("#hdr-asgard"),p=e.querySelector("#hdr-asgard-val"),l=e.querySelector("#hdr-asgard-time"),g=e.querySelector("#hdr-fw"),d=e.querySelectorAll(".menu-link");function b(){let f=B("section");d.forEach(m=>{m.classList.toggle("active",m.getAttribute("data-section")===f)})}function v(){let f=B("live"),m=B("pendingWrites"),_=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!f);let u,w;m>0?(u=y("status.saving"),w="saving"):_?(u=window.HV6_DASHBOARD_CONFIG.mockLabel||y("status.mock"),w="synced"):f?(u=y("status.live"),w="synced"):(u=y("status.offline"),w="offline"),r.textContent=u,r.className="meta-chip meta-chip-state "+w,a.textContent=lt(L(n.uptime)),i.textContent=Lo(L(n.wifi));let k=L(n.asgardLastPushC),z=L(n.asgardLastPushAgeS),h=ee(n.asgardEnabled)&&k!=null&&Number.isFinite(k);s.hidden=!h,h&&(p.textContent=k.toFixed(2)+"\xB0C",l.textContent=Co(z));let E=B("firmwareVersion")||D(n.firmware);g.textContent=E?"FW "+E:""}d.forEach(f=>{f.addEventListener("click",m=>{m.preventDefault(),Ut(f.getAttribute("data-section"))})}),q("section",b),q("live",v),q("pendingWrites",v),q("firmwareVersion",v),S(n.uptime,v),S(n.wifi,v),S(n.asgardLastPushC,v),S(n.asgardLastPushAgeS,v),S(n.asgardEnabled,v),S(n.firmware,v),b(),C(e),v()}});var Mr=`
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
.connectivity-card .st td { padding: 7px 0; font-size: .92rem; }
.connectivity-card .st td:first-child { color: var(--text-secondary); width: 42%; }
.connectivity-card .st td:last-child { text-align: right; font-weight: 700; color: var(--text-strong); font-family: var(--mono); }
.connectivity-card .st tr:not(:last-child) td { border-bottom: 1px solid rgba(255,255,255,.07); }
`;A("connectivity-card",Mr);var Ar=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,vs=T({tag:"connectivity-card",render:Ar,onMount(t,e){let o=e.querySelector(".cc-ip"),r=e.querySelector(".cc-ssid"),a=e.querySelector(".cc-mac"),i=e.querySelector(".cc-up");function s(){o.textContent=D(n.ip)||"---",r.textContent=D(n.ssid)||"---",a.textContent=D(n.mac)||"---",i.textContent=lt(L(n.uptime))}S(n.ip,s),S(n.ssid,s),S(n.mac,s),S(n.uptime,s),C(e),s()}});var Er="http://www.w3.org/2000/svg",Nr=`
.chart-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;        /* tooltip anchor */
}

.chart-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 4px;
}
.chart-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}
.chart-title {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}
.chart-head .chart-sub {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .4px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .3px;
}
.chart-legend-marker {
  width: 11px;
  height: 11px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 32%, transparent);
  flex-shrink: 0;
}

.chart-card svg { width: 100%; height: auto; display: block; overflow: visible; }
.chart-grid { stroke: rgba(150,168,205,.14); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-axis { stroke: rgba(150,168,205,.34); stroke-width: 1; vector-effect: non-scaling-stroke; }
.chart-tick { fill: var(--chart-axis); font-size: 11px; opacity: .85; }
.chart-axis-label {
  fill: var(--chart-axis); font-size: 9px; letter-spacing: .8px;
  text-transform: uppercase; opacity: .75;
}
/* Time labels use tabular Montserrat digits: equal width, no slashed zero. */
.chart-hour {
  fill: rgba(202,219,248,.78);
  font-family: "Montserrat", sans-serif;
  font-size: 9px;
  font-weight: 500;
  font-variant-numeric: tabular-nums lining-nums;
  font-feature-settings: "tnum" 1, "lnum" 1;
  letter-spacing: 0;
}
.chart-hour.now { fill: var(--series-solar); }
.chart-hour.day2 { fill: rgba(202,219,248,.5); }
.chart-empty { fill: var(--text-faint); font-size: 12px; letter-spacing: .3px; }

/* hover cursor + tooltip */
.chart-cursor-line { stroke: rgba(233,222,210,.45); stroke-width: 1; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
.chart-cursor-dot { stroke: var(--card); stroke-width: 1.5; }
.chart-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 20;
  background: var(--overlay-bg);
  border: 1px solid var(--panel-border);
  border-radius: 8px;
  padding: 7px 9px;
  font-size: .7rem;
  color: var(--text-strong);
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  white-space: nowrap;
  opacity: 0;
  transition: opacity .1s ease;
}
.chart-tooltip.show { opacity: 1; }
.chart-tooltip .tt-time { font-weight: 800; letter-spacing: .4px; margin-bottom: 4px; color: var(--text-strong); }
.chart-tooltip .tt-row { display: flex; align-items: center; gap: 6px; line-height: 1.5; }
.chart-tooltip .tt-swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }
.chart-tooltip .tt-val { margin-left: auto; font-variant-numeric: tabular-nums; font-weight: 700; }
`;A("chart-kit",Nr);function Z(t,e,o){let r=document.createElementNS(Er,t);if(e)for(let a in e)r.setAttribute(a,e[a]);return o!=null&&(r.textContent=o),r}function qe(t){if(!t.length)return"";if(t.length<3)return"M "+t.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let e=.16,o=`M ${t[0].x.toFixed(2)} ${t[0].y.toFixed(2)}`;for(let r=0;r<t.length-1;r++){let a=t[r-1]||t[r],i=t[r],s=t[r+1],p=t[r+2]||s,l=i.x+(s.x-a.x)*e,g=i.y+(s.y-a.y)*e,d=s.x-(p.x-i.x)*e,b=s.y-(p.y-i.y)*e;o+=` C ${l.toFixed(2)} ${g.toFixed(2)}, ${d.toFixed(2)} ${b.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function Fo(t,e,o){let r=t.filter(p=>Number.isFinite(p));if(!r.length)return{min:e,max:o};let a=Math.min(...r),i=Math.max(...r);a===i&&(a-=1,i+=1);let s=(i-a)*.12;return{min:a-s,max:i+s}}function ct(t,e,o){let r=document.createElement("div");r.className="chart-tooltip",e.appendChild(r);let a=Z("g",{class:"chart-cursor",style:"display:none"}),i=Z("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});a.appendChild(i);let s=[];t.appendChild(a);function p(b){let v=0,f=1/0;for(let m=0;m<o.count;m++){let _=Math.abs(b-o.xAt(m));_<f&&(f=_,v=m)}return v}function l(b){let v=t.getScreenCTM();if(!v)return null;let f=t.createSVGPoint();return f.x=b.clientX,f.y=b.clientY,f.matrixTransform(v.inverse())}function g(b){if(!o.count)return;let v=l(b);if(!v)return;let f=p(v.x),m=o.xAt(f);i.setAttribute("x1",m),i.setAttribute("x2",m);let _=o.dots(f);for(;s.length<_.length;){let z=Z("circle",{class:"chart-cursor-dot",r:3.4});a.appendChild(z),s.push(z)}s.forEach((z,h)=>{h<_.length?(z.setAttribute("cx",m),z.setAttribute("cy",_[h].y),z.setAttribute("fill",_[h].color),z.style.display=""):z.style.display="none"}),a.style.display="";let u=o.rows(f).map(z=>`<div class="tt-row"><span class="tt-swatch" style="background:${z.color}"></span>${z.label}<span class="tt-val">${z.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(f)}</div>${u}`,r.classList.add("show");let w=e.getBoundingClientRect(),k=b.clientX-w.left+14;k+r.offsetWidth>w.width-6&&(k=b.clientX-w.left-r.offsetWidth-14),r.style.left=Math.max(6,k)+"px",r.style.top=Math.max(6,b.clientY-w.top+12)+"px"}function d(){r.classList.remove("show"),a.style.display="none"}return t.addEventListener("pointermove",g),t.addEventListener("pointerleave",d),()=>{t.removeEventListener("pointermove",g),t.removeEventListener("pointerleave",d),r.remove()}}var je=1e3,Dt=180,ye=14,Tr=42,Dr=44,Le=42,ut=je-Le-Tr,ke=Dt-ye-Dr,Ee=ye+ke,Pt=24*3600,Mo=ie+2,Ao=ie+3,dt=ie+4,Pr="var(--series-warm)",Rr="var(--series-cool)",Eo="var(--series-solar)",Or=`
.graph-widgets { display: grid; gap: 12px; }
.graph-widgets .chart-card svg {
  border-radius: 10px;
  background: rgba(0,32,46,.34);
}
.graph-widgets .gw-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.graph-widgets .gw-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.graph-widgets .gw-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.graph-widgets .gw-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.graph-widgets .gw-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.graph-widgets .gw-toggle[data-layer="flow"] { color: var(--series-warm); }
.graph-widgets .gw-toggle[data-layer="return"] { color: var(--series-cool); }
.graph-widgets .gw-toggle[data-layer="demand"] { color: var(--series-solar); }
`;A("graph-widgets",Or);var No=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers.forecast" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',To=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Hr=t=>t.variant==="flow-return"?`<div class="graph-widgets">${No()}</div>`:t.variant==="demand"?`<div class="graph-widgets">${To()}</div>`:`<div class="graph-widgets">${No()}${To()}</div>`;function Do(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1):"\u2014"}function qr(t,e){return Number.isFinite(t)?e==="%"?Math.round(t)+"%":t.toFixed(1)+"\xB0":"\u2014"}function Rt(t,e,o){let r=[];for(let a=0;a<t.length;a++){let i=t[a];if(!i||i[0]<o)continue;let s=i[e];s==null||!Number.isFinite(s)||r.push({t:i[0],v:s})}return r}var gt=(t,e)=>Le+Math.max(0,Math.min(1,(t-e)/Pt))*ut;function Ir(t,e,o){let r=Number(Date.now()/1e3)|0,a=3600,i=Math.ceil((r-Pt)/a)*a,s=Math.floor(r/a)*a,p=Math.floor(r/a)*a;for(let g=i;g<=s;g+=a){let d=o-(r-g),b=gt(d,e),v=new Date(g*1e3),f=g===p,m=Ee+16;t.appendChild(Z("text",{x:b,y:m,"text-anchor":"end",transform:`rotate(-45 ${b.toFixed(1)} ${m})`,class:"chart-hour"+(f?" now":"")},String(v.getHours()).padStart(2,"0")))}let l=gt(o,e);t.appendChild(Z("line",{x1:l,y1:ye,x2:l,y2:Ee,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function Br(t){let e=[];if(t.forEach(i=>i.forEach(s=>e.push(s.v))),!e.length)return{min:0,max:10};let o=Math.min(...e),r=Math.max(...e);o===r&&(o-=.5,r+=.5);let a=(r-o)*.1;return o-=a,r+=a,{min:o,max:r}}function Wr(t,e,o){let r=t.filter(a=>a.unit==="C").map(a=>Rt(e,a.index,o));return Br(r)}function Po(t,e,o,r,a,i){t.innerHTML="",t.setAttribute("viewBox",`0 0 ${je} ${Dt}`),t.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(m=>Rt(r,m.index,a));if(!s.some(m=>m.length))return t.appendChild(Z("text",{x:je/2,y:Dt/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let p=Wr(o,r,a),l=Math.max(.001,p.max-p.min),g=m=>ye+(1-(m-p.min)/l)*ke,d=m=>ye+(1-Math.max(0,Math.min(100,m))/100)*ke,b=(m,_)=>m.unit==="%"?d(_):g(_);for(let m=0;m<3;m++){let _=m/2,u=ye+_*ke;t.appendChild(Z("line",{x1:Le,y1:u,x2:Le+ut,y2:u,class:"chart-grid"})),o.some(w=>w.unit==="C")&&t.appendChild(Z("text",{x:Le-6,y:u+4,"text-anchor":"end",class:"chart-tick"},Do(p.max-l*_,"C")+"\xB0")),o.some(w=>w.unit==="%")&&t.appendChild(Z("text",{x:Le+ut+6,y:u+4,"text-anchor":"start",class:"chart-tick"},Do(100-100*_,"%")))}t.appendChild(Z("line",{x1:Le,y1:Ee,x2:Le+ut,y2:Ee,class:"chart-axis"})),o.some(m=>m.unit==="C")&&t.appendChild(Z("text",{x:9,y:ye+ke/2,transform:`rotate(-90 9 ${(ye+ke/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},y("overview.graph.axis.temp"))),o.some(m=>m.unit==="%")&&t.appendChild(Z("text",{x:je-9,y:ye+ke/2,transform:`rotate(90 ${je-9} ${(ye+ke/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},y("overview.graph.axis.demand"))),Ir(t,a,i),o.forEach((m,_)=>{let u=s[_].map(k=>({x:gt(k.t,a),y:b(m,k.v)}));if(!u.length)return;let w=qe(u);m.fill&&t.appendChild(Z("path",{d:w+` L ${u[u.length-1].x.toFixed(1)} ${Ee} L ${u[0].x.toFixed(1)} ${Ee} Z`,fill:m.fill,stroke:"none"})),t.appendChild(Z("path",{d:w,fill:"none",stroke:m.color,"stroke-width":String(m.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let v=[];for(let m=0;m<r.length;m++){let _=r[m];if(!_||_[0]<a)continue;let u=o.map(w=>_[w.index]);u.every(w=>w==null||!Number.isFinite(w))||v.push({t:_[0],vals:u})}if(!v.length)return null;let f=Date.now();return ct(t,e,{count:v.length,plotTop:ye,plotBottom:Ee,xAt:m=>gt(v[m].t,a),label:m=>new Date(f-(i-v[m].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:m=>o.map((_,u)=>({y:b(_,v[m].vals[u]),color:_.color})).filter((_,u)=>Number.isFinite(v[m].vals[u])),rows:m=>o.map((_,u)=>({color:_.color,label:_.label,value:qr(v[m].vals[u],_.unit)})).filter((_,u)=>Number.isFinite(v[m].vals[u]))})}function pt(t,e,o){let r=Rt(t,e,o);return r.length?r[r.length-1].v:null}var Cs=T({tag:"graph-widgets",state:t=>({variant:t&&t.variant||"both"}),render:Hr,onMount(t,e){let o=e.querySelector(".gw-dt"),r=e.querySelector(".gw-demand-text"),a=e.querySelector(".gw-flow"),i=e.querySelector(".gw-demand"),s=Array.from(e.querySelectorAll(".gw-toggle")),p={flow:!0,return:!0,demand:!0},l=null,g=null;function d(){s.forEach(f=>{let m=f.dataset.layer;f.classList.toggle("is-off",!p[m]),f.setAttribute("aria-pressed",p[m]?"true":"false")})}function b(){let f=[];return p.flow&&f.push({index:Mo,color:Pr,label:y("overview.graph.layers.flow"),unit:"C",width:2.4}),p.return&&f.push({index:Ao,color:Rr,label:y("overview.graph.layers.return"),unit:"C",width:2}),p.demand&&f.push({index:dt,color:Eo,label:y("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function v(){let f=B("zoneStateHistory"),m=f&&Array.isArray(f.entries)?f.entries:[],_=f&&f.uptime_s||Number(Date.now()/1e3)|0,u=_-Pt;if(a){l&&l();let w=pt(m,Mo,u),k=pt(m,Ao,u),z=pt(m,dt,u),h=[];w!=null&&k!=null&&h.push("\u0394 "+(w-k).toFixed(1)+"\xB0"),z!=null&&h.push(Math.round(z)+"%"),o.textContent=h.length?h.join(" \xB7 "):"\u2014",l=Po(a,a.closest(".chart-card"),b(),m,u,_)}if(i){g&&g();let w=pt(m,dt,u);r.textContent=w!=null?Math.round(w)+"%":"\u2014",g=Po(i,i.closest(".chart-card"),[{index:dt,color:Eo,label:y("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],m,u,_)}}s.forEach(f=>{f.addEventListener("click",()=>{let m=f.dataset.layer;p[m]=!p[m],!p.flow&&!p.return&&!p.demand&&(p[m]=!0),d(),v()})}),q("zoneStateHistory",v),C(e),d(),v()}});var Zr=.5;function jr(t){let e=String(t||"").toUpperCase(),o=0;return e.includes("N")&&(o|=1),e.includes("E")&&(o|=2),e.includes("S")&&(o|=4),e.includes("W")&&(o|=8),o}function $r(t,e){let o=[[1,0],[2,90],[4,180],[8,270]],r=0;for(let[a,i]of o){if(!(t&a))continue;let s=(Number(e)-i)*Math.PI/180;r=Math.max(r,Math.cos(s))}return Math.max(0,r)}function Vr(t,e){let o=jr(D(c.exteriorWalls(e)));if(!o)return 0;let r=Number(L(c.windExposure(e))),a=Number(L(c.solarGain(e))),i=Number.isFinite(r)?r:.5,s=Number.isFinite(a)?a:.3,p=$r(o,t[2]),l=i*p*(Number(t[1])/10),g=Math.max(0,21-Number(t[0]))/10,d=s*(Math.max(0,Number(t[3])||0)/800);return Math.max(0,l*g-d)}function Ro(t,e){let o=Math.min(e||(t?t.length:0),t?t.length:0),r=Number(L(n.forecastLoadThreshold)),a=Number(L(n.forecastMaxOffsetC)),i=Number.isFinite(r)?r:1,s=Number.isFinite(a)?a:1.5,p=[];for(let l=1;l<=6;l++){let g=Number(L(c.thermalLeadH(l))),d=Math.max(0,Math.min(24,Number.isFinite(g)?Math.round(g):4)),b=[];for(let v=0;v<o;v++){let f=Math.min(o-1,v+d),m=0;for(let u=v;u<=f;u++)m=Math.max(m,Vr(t[u],l));let _=m-i;b.push(_>0?Math.min(s,_*Zr):0)}p.push({zone:l,offsets:b})}return p}function Oo(t,e){t(n.forecastLoadThreshold,e),t(n.forecastMaxOffsetC,e);for(let o=1;o<=6;o++)t(c.exteriorWalls(o),e),t(c.windExposure(o),e),t(c.solarGain(o),e),t(c.thermalLeadH(o),e)}var we={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#7aa7ce"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#4e6977"},4:{labelKey:"state.waitTemp",color:"#4e6977"},5:{labelKey:"state.heating",color:"#ff8531"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Ve=24*3600,mt=12*3600,Gr=Ve+mt,Ne=18,Bt=4,Ce=54,Ge=32,Fe=4,ft=10,Io=6,Bo="#ffc14d",Wo="#7aa7ce",Ur=.5,Ot=9,Ht=6,qt=2,Ho=ie+1,Zo=Fe+ie*(Ne+Bt)-Bt,It=Zo+Io,$e=Zo+Io+ft+Ge,Xr=`
.timeline-card {
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  background: var(--panel-bg-vibrant);
  padding: 14px 16px;
  box-shadow: var(--panel-shadow);
}

.timeline-head {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-bottom: 10px;
}
.timeline-head::before {
  content: '';
  width: 4px;
  height: 13px;
  border-radius: 2px;
  background: var(--accent);
  flex-shrink: 0;
}
.timeline-head span {
  color: var(--accent);
  font-size: .74rem;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
}

.timeline-head strong {
  margin-left: auto;
  color: var(--text-faint);
  font-size: .70rem;
  font-weight: 600;
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

.tl-legend-dot.expected {
  width: 14px;
  height: 4px;
  opacity: .55;
  border-radius: 999px;
}
`;A("zone-state-timeline",Xr);var Yr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h / +12 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Kr(t,e,o){if(!t||!t.entries||t.entries.length===0)return null;let r=t.entries,a=t.uptime_s||e||0,i=Number(Date.now()/1e3)|0,s=1e3,p=s-Ce;function l(F){let N=(F+Ve)/Gr;return Ce+Math.max(0,Math.min(1,N))*p}function g(F){return F-a}let d="http://www.w3.org/2000/svg",b=document.createElementNS(d,"svg");b.setAttribute("viewBox","0 0 "+s+" "+$e),b.classList.add("timeline-svg");let v=document.createElementNS(d,"rect");v.setAttribute("x",Ce),v.setAttribute("y",Fe),v.setAttribute("width",p),v.setAttribute("height",$e-Fe-Ge),v.setAttribute("fill","rgba(0,32,46,0.55)"),v.setAttribute("rx","4"),b.appendChild(v);let f=l(0),m=document.createElementNS(d,"rect");m.setAttribute("x",f),m.setAttribute("y",Fe),m.setAttribute("width",Ce+p-f),m.setAttribute("height",$e-Fe-Ge),m.setAttribute("fill","rgba(255,166,0,0.035)"),b.appendChild(m);let _=[-24,-18,-12,-6,0,6,12].map(F=>F*3600);for(let F of _){let N=l(F),M=document.createElementNS(d,"line");M.setAttribute("x1",N),M.setAttribute("y1",Fe),M.setAttribute("x2",N),M.setAttribute("y2",$e-Ge),M.setAttribute("stroke",F===0?"var(--series-solar)":"rgba(120,146,200,.16)"),M.setAttribute("stroke-width","1"),F===0&&(M.setAttribute("stroke-dasharray","2 3"),M.setAttribute("opacity",".55"),M.setAttribute("vector-effect","non-scaling-stroke")),b.appendChild(M)}b.appendChild(Jr(d,"text",{x:f+4,y:Fe+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));let u=(()=>{let F=o&&Array.isArray(o.hours)?o.hours:[];return!F.length||!o.base_epoch?[]:Ro(F,o.count||F.length)})(),w=u.reduce((F,N)=>{for(let M of N.offsets)F=Math.max(F,Number(M)||0);return F},0);function k(F){if(!ee(c.enabled(F))||!ee(n.drivers))return 0;let N=String(D(c.state(F))||"").toUpperCase();return N==="MANUAL"?1:N==="CALIBRATING"?2:N==="WAITING_CALIBRATION"?3:N==="WAITING_ROOM_TEMP"||N==="UNKNOWN"?4:N==="HEATING"?5:N==="IDLE"?6:N==="OVERHEATED"?7:6}function z(F,N){let M=k(F);if(M<=4||M===7)return M;let W=Number(L(c.temp(F))),J=Number(L(c.setpoint(F)));if(!Number.isFinite(W)||!Number.isFinite(J))return 4;let se=Number(L(c.preheatAdvance(F))),U=Number.isFinite(se)?Math.max(0,se):0,oe=J+Math.max(0,Number(N)||0)-Ur+U;return W<oe?5:6}for(let F=0;F<ie;F++){let N=Fe+F*(Ne+Bt),M=document.createElementNS(d,"rect");M.setAttribute("x",Ce),M.setAttribute("y",N),M.setAttribute("width",p),M.setAttribute("height",Ne),M.setAttribute("fill",F%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),b.appendChild(M);let W=document.createElementNS(d,"text");W.setAttribute("x",Ce-4),W.setAttribute("y",N+Ne/2+1),W.setAttribute("text-anchor","end"),W.setAttribute("dominant-baseline","middle"),W.setAttribute("fill","rgba(233,222,210,.62)"),W.setAttribute("font-size","9.5"),W.setAttribute("font-family","Montserrat, sans-serif"),W.setAttribute("font-weight","600"),W.textContent="Z"+(F+1),b.appendChild(W);let J=r.map(te=>({rel:g(te[0]),state:te[F+1]})).filter(te=>te.rel>=-Ve&&te.rel<=0),se=(te,oe,Q)=>{if(Q===255)return;let X=we[Q]||we[255];if(X.color==="transparent")return;let xe=l(te),pe=l(oe),ue=Math.max(1,pe-xe),he=document.createElementNS(d,"rect");he.setAttribute("x",xe),he.setAttribute("y",N+(Ne-Ot)/2),he.setAttribute("width",ue),he.setAttribute("height",Ot),he.setAttribute("fill",X.color),he.setAttribute("rx",String(Ot/2)),he.setAttribute("opacity","0.9"),b.appendChild(he)};if(J.length){let te=J[0].rel,oe=J[0].state;for(let Q=1;Q<J.length;Q++){let X=J[Q];X.state!==oe&&(se(te,X.rel,oe),te=X.rel,oe=X.state)}se(te,0,oe)}let U=u[F];if(U&&o&&o.base_epoch){let te=[],oe=[];for(let Q=0;Q<U.offsets.length;Q++){let X=Number(U.offsets[Q])||0,xe=o.base_epoch+Q*3600-i,pe=xe+3600;if(pe<=0||xe>=mt)continue;let ue=Math.max(0,xe),he=Math.min(mt,pe),$t=z(F+1,X),Ue=te[te.length-1];if(Ue&&Ue.state===$t&&Math.abs(Ue.end-ue)<2?Ue.end=he:te.push({start:ue,end:he,state:$t}),X>0&&w>0){let Ie=oe[oe.length-1];Ie&&Math.abs(Ie.end-ue)<2?(Ie.end=he,Ie.peak=Math.max(Ie.peak,X)):oe.push({start:ue,end:he,peak:X})}}for(let Q of te){let X=we[Q.state]||we[255];if(!X||X.color==="transparent")continue;let xe=l(Q.start),pe=l(Q.end),ue=document.createElementNS(d,"rect");ue.setAttribute("x",xe),ue.setAttribute("y",N+(Ne-Ht)/2),ue.setAttribute("width",Math.max(1,pe-xe)),ue.setAttribute("height",Ht),ue.setAttribute("fill",X.color),ue.setAttribute("rx",String(Ht/2)),ue.setAttribute("opacity",Q.state===5?"0.50":"0.34"),b.appendChild(ue)}for(let Q of oe){let X=l(Q.start),xe=l(Q.end),pe=document.createElementNS(d,"rect");pe.setAttribute("x",X+1),pe.setAttribute("y",N+Ne-qt-2),pe.setAttribute("width",Math.max(1,xe-X-2)),pe.setAttribute("height",String(qt)),pe.setAttribute("fill",Wo),pe.setAttribute("rx",String(qt/2)),pe.setAttribute("opacity",String(Math.min(.82,.26+Q.peak/w*.48))),b.appendChild(pe)}}}{let F=document.createElementNS(d,"rect");F.setAttribute("x",Ce),F.setAttribute("y",It),F.setAttribute("width",p),F.setAttribute("height",ft),F.setAttribute("fill","rgba(188,80,144,0.10)"),F.setAttribute("rx","2"),b.appendChild(F);let N=document.createElementNS(d,"text");N.setAttribute("x",Ce-4),N.setAttribute("y",It+ft/2+1),N.setAttribute("text-anchor","end"),N.setAttribute("dominant-baseline","middle"),N.setAttribute("fill","rgba(233,222,210,.62)"),N.setAttribute("font-size","8.5"),N.setAttribute("font-family","Montserrat, sans-serif"),N.setAttribute("font-weight","600"),N.textContent=y("overview.timeline.absorb"),b.appendChild(N);let M=r.map(W=>({rel:g(W[0]),on:W.length>Ho?W[Ho]:0})).filter(W=>W.rel>=-Ve&&W.rel<=0);if(M.length){let W=(U,te)=>{let oe=l(U),Q=Math.max(1,l(te)-oe),X=document.createElementNS(d,"rect");X.setAttribute("x",oe),X.setAttribute("y",It),X.setAttribute("width",Q),X.setAttribute("height",ft),X.setAttribute("fill",Bo),X.setAttribute("rx","2"),X.setAttribute("opacity","0.9"),b.appendChild(X)},J=M[0].rel,se=M[0].on;for(let U=1;U<M.length;U++)M[U].on!==se&&(se&&W(J,M[U].rel),J=M[U].rel,se=M[U].on);se&&W(J,0)}}let h=$e-Ge+15,E=3600,H=Math.ceil((i-Ve)/E)*E,G=Math.floor((i+mt)/E)*E,$=Math.floor(i/E)*E;for(let F=H;F<=G;F+=E){let N=F-i,M=l(N),W=new Date(F*1e3),J=String(W.getHours()).padStart(2,"0"),se=F===$,U=document.createElementNS(d,"text");U.setAttribute("x",M),U.setAttribute("y",h),U.setAttribute("text-anchor","end"),U.setAttribute("fill",se?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),U.setAttribute("font-size","9"),U.setAttribute("font-family",'"Montserrat", sans-serif'),U.setAttribute("font-weight","500"),U.setAttribute("font-variant-numeric","tabular-nums lining-nums"),U.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),U.setAttribute("letter-spacing","0"),U.setAttribute("transform",`rotate(-45 ${M.toFixed(1)} ${h})`),U.textContent=J,b.appendChild(U)}return b}function Jr(t,e,o,r){let a=document.createElementNS(t,e);for(let i in o)a.setAttribute(i,o[i]);return r!=null&&(a.textContent=r),a}function qo(t){t.innerHTML="";let e=[{code:5,...we[5]},{code:6,...we[6]},{code:0,...we[0]},{code:1,...we[1]},{code:7,...we[7]},{code:2,...we[2]}];for(let i of e){let s=document.createElement("div");s.className="tl-legend-item",s.innerHTML='<span class="tl-legend-dot" style="background:'+i.color+'"></span>'+(i.labelKey?y(i.labelKey):""),t.appendChild(s)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Bo+'"></span>'+y("overview.timeline.preheatAbsorption"),t.appendChild(o);let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot expected" style="background:'+we[5].color+'"></span>'+y("overview.timeline.expectedState"),t.appendChild(r);let a=document.createElement("div");a.className="tl-legend-item",a.innerHTML='<span class="tl-legend-dot" style="background:'+Wo+'"></span>'+y("overview.timeline.weatherPreload"),t.appendChild(a)}var Hs=T({tag:"zone-state-timeline",render:Yr,onMount(t,e){let o=e.querySelector(".tl-body"),r=e.querySelector(".timeline-legend");qo(r);function a(){let i=B("zoneStateHistory"),s=et(),p=(()=>{let g=B&&B("zoneStateHistory");return g&&g.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!i||!i.entries||i.entries.length===0){let g=document.createElement("div");g.className="timeline-empty",g.textContent=y("overview.timeline.noHistory"),o.appendChild(g);return}let l=Kr(i,p,s);l&&o.appendChild(l)}q("zoneStateHistory",a),q("zoneNames",a),q("forecastHours",a),Oo(S,a),S(n.drivers,a);for(let i=1;i<=ie;i++)S(c.enabled(i),a),S(c.state(i),a),S(c.temp(i),a),S(c.setpoint(i),a),S(c.preheatAdvance(i),a);C(e),a()}});var Qr=`
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
`;A("zone-grid",Qr);var ea=()=>'<div class="zone-grid"></div>',Ws=T({tag:"zone-grid",render:ea,onMount(t,e){for(let o=1;o<=6;o++)e.appendChild(j("zone-card",{zone:o}))}});var ta=`
.zone-card {
	display: grid;
	grid-template-rows: auto auto auto;
	gap: 2px;
	padding: 7px 10px;
	border-radius: 12px;
	border: 1px solid var(--panel-border);
	border-left: 3px solid rgba(120,146,200,.45);
	background: var(--panel-bg);
	cursor: pointer;
	transition: .18s ease;
	min-width: 0;
	overflow: hidden;
}
.zone-card:hover {
	border-color: rgba(124,155,208,.42);
	border-left-color: rgba(124,155,208,.7);
	background: rgba(0,47,69,.56);
}
.zone-card.active {
	border-color: rgba(255,133,49,.44);
	border-left-color: rgba(255,133,49,.84);
	background: rgba(255,133,49,.10);
}

.zone-card.disabled {
	opacity: .72;
	border-left-color: rgba(120,146,200,.35);
}

.zone-card.zs-heating { border-left-color: #ff8531; }
.zone-card.zs-idle { border-left-color: #7aa7ce; }
.zone-card.zs-fault { border-left-color: #ff6361; }
.zone-card.zs-off { border-left-color: rgba(120,146,200,.4); }

.zone-card .zc-state-row {
	display: flex;
	align-items: center;
	gap: 5px;
	line-height: 1;
	min-width: 0;
}

.zone-card .zc-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	flex-shrink: 0;
	background: rgba(120,146,200,.4);
}

.zone-card .zc-state-label {
	font-size: 12px;
	font-weight: 700;
	text-transform: uppercase;
	letter-spacing: .55px;
	color: var(--text-secondary);
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.zone-card .zc-link {
	margin-left: auto;
	padding: 1px 6px 2px;
	border-radius: 999px;
	border: 1px solid rgba(255,133,49,.44);
	background: rgba(255,133,49,.12);
	color: var(--accent);
	font-size: 9px;
	font-weight: 800;
	line-height: 1.2;
	letter-spacing: .55px;
	white-space: nowrap;
}
.zone-card .zc-link[hidden] { display: none; }

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
`;A("zone-card",ta);var oa=t=>`
	<div class="zone-card" data-zone="${t.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
		<div class="zc-zone-name">${Y(t.zone)}</div>
		<div class="zc-friendly">${_e(t.zone)||"---"}</div>
	</div>
`,Ys=T({tag:"zone-card",state:t=>({zone:t.zone}),render:oa,onMount(t,e){let o=t.zone,r=c.temp(o),a=c.state(o),i=c.enabled(o),s=e.querySelector(".zc-state-label"),p=e.querySelector(".zc-dot"),l=e.querySelector(".zc-link"),g=e.querySelector(".zc-zone-name"),d=e.querySelector(".zc-friendly");function b(f){let m=String(f||"").match(/\d+/);return m?Number(m[0]):0}function v(){let f=ee(i),m=String(D(a)||"").toUpperCase()||"OFF",_=String(D(c.motorLastFault(o))||"").toUpperCase(),u=_&&_!=="NONE"&&_!=="OK",w=f&&(m==="FAULT"||u)?"FAULT":m,k=B("selectedZone")===o,z=_e(o);g.textContent=Y(o),d.textContent=z||be(L(r));let h=f?w:"OFF";s.textContent=h==="HEATING"?y("state.heating"):h==="IDLE"?y("state.idle"):h==="FAULT"?y("common.fault"):h==="MANUAL"?y("state.manual"):h==="OVERHEATED"?y("state.overheated"):h==="CALIBRATING"?y("state.calibrating"):y("state.off");let E=b(D(c.syncTo(o))),H=[];for(let M=1;M<=6;M++)M!==o&&b(D(c.syncTo(M)))===o&&H.push(M);let G=E>0&&E!==o||H.length>0;l.hidden=!G,l.textContent=E>0&&E!==o?y("zone.card.linkZone",{zone:E}):H.length>1?y("zone.card.groupCount",{count:H.length}):y("zone.card.linkZone",{zone:H[0]});let $=E>0&&E!==o?y("zone.card.groupedWith",{zones:Y(E)}):H.length>0?y("zone.card.groupedWith",{zones:H.map(Y).join(", ")}):"";e.title=u?y("zone.card.fault",{fault:_}):$;let F=h==="HEATING"?"#ffd380":h==="IDLE"?"#7aa7ce":h==="FAULT"?"#ff6361":"#6E7E96",N=h==="HEATING"?"#ff8531":h==="IDLE"?"#7aa7ce":h==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";s.style.color=F,p.style.background=N,p.style.boxShadow=h==="HEATING"?"0 0 5px rgba(255,133,49,.6)":h==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",e.classList.toggle("active",k),e.classList.toggle("disabled",!f),e.classList.toggle("zs-heating",f&&h==="HEATING"),e.classList.toggle("zs-fault",f&&h==="FAULT"),e.classList.toggle("zs-idle",f&&h!=="HEATING"&&h!=="FAULT"),e.classList.toggle("zs-off",!f)}e.addEventListener("click",()=>{Xt(o)}),S(r,v),S(a,v),S(i,v),S(c.motorLastFault(o),v);for(let f=1;f<=6;f++)S(c.syncTo(f),v);q("selectedZone",v),q("zoneNames",v),v()}});var ra=`
.zone-detail {
  background: var(--panel-bg-flat);
  border: 1px solid var(--panel-border);
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

/* Header-right cluster: enable toggle sits next to the state pill. */
.zone-detail .zd-head-ctrl {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: rgba(255,133,49,.15);
  color: var(--state-warn);
  border-color: rgba(255,133,49,.3);
}

.zone-detail .zd-badge.badge-idle {
  background: rgba(122,167,206,.13);
  color: var(--series-cool);
  border-color: rgba(122,167,206,.28);
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

/* Body layout \u2014 the header's border-bottom is the only divider (no second
   border-top here, which previously read as a doubled horizontal line). */
.zone-detail .zd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  border-color: rgba(255,133,49,.55);
  color: var(--accent);
  background: rgba(255,133,49,.1);
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
/* The [hidden] attribute must beat the display:flex above, or the row shows
   "Last fault NONE" even when there is no fault. */
.zone-detail .zd-fault[hidden] { display: none; }
.zone-detail .zd-fault-label { color: var(--text-secondary); }
.zone-detail .zd-fault-val { color: var(--state-danger); font-weight: 700; font-family: var(--mono); }
`;A("zone-detail",ra);var aa=t=>`
  <div class="zone-detail" data-zone="${t.zone}">
    <div class="zd-head">
      <div class="zd-title">${Y(t.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" data-i18n-label="zone.detail.enabled" data-i18n-title="zone.detail.enabled" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
    </div>
    <div class="zd-body">
      <div>
        <div class="zd-kicker" data-i18n="zone.detail.targetTemperature">Target Temperature</div>
        <div class="zd-target-row">
          <button class="spb btn-dec" data-i18n-label="common.decrease" aria-label="decrease">\u2212</button>
          <div class="zd-setpoint">---</div>
          <button class="spb btn-inc" data-i18n-label="common.increase" aria-label="increase">+</button>
        </div>
      </div>
      <div class="zd-stats">
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.currentTemp">Current Temp</div><div class="zd-stat-value zd-temp">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.returnTemp">Return Temp</div><div class="zd-stat-value zd-ret">---</div></div>
        <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.flowPct">Flow %</div><div class="zd-stat-value zd-valve">---</div></div>
      </div>
      <div class="zd-motor">
        <div class="zd-motor-title" data-i18n="zone.detail.motorLearned">Motor learned parameters</div>
        <div class="zd-stats">
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openRipples">Open Ripples</div><div class="zd-stat-value zd-orip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeRipples">Close Ripples</div><div class="zd-stat-value zd-crip">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.openFactor">Open Factor</div><div class="zd-stat-value zd-ofac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.closeFactor">Close Factor</div><div class="zd-stat-value zd-cfac">---</div></div>
          <div class="zd-stat"><div class="zd-stat-label" data-i18n="zone.detail.preheatAdv">Preheat Adv.</div><div class="zd-stat-value zd-ph">---</div></div>
        </div>
        <div class="zd-fault" hidden><span class="zd-fault-label" data-i18n="zone.detail.lastFault">Last fault</span><span class="zd-fault-val">NONE</span></div>
      </div>
    </div>
  </div>
`;function jo(t){return t!=null?Number(t).toFixed(2)+"x":"---"}function $o(t){return t!=null?Number(t).toFixed(0):"---"}function na(t){return t!=null?Number(t).toFixed(2)+"C":"---"}function sa(t,e){if(!e)return y("common.disabled");let o=String(t||"IDLE").toUpperCase();return o==="HEATING"?y("state.heating"):o==="IDLE"?y("state.idle"):o==="OFF"?y("state.off"):o==="FAULT"?y("common.fault"):o==="MANUAL"?y("state.manual"):o==="OVERHEATED"?y("state.overheated"):o==="CALIBRATING"?y("state.calibrating"):o}var ni=T({tag:"zone-detail",state:t=>({zone:t.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:aa,methods:{update(t,e){let o=B("selectedZone"),r=String(D(c.state(o))||"").toUpperCase(),a=ee(c.enabled(o));this.zone=o,t.dataset.zone=String(o),e.title.textContent=Y(o),e.setpoint.textContent=be(L(c.setpoint(o))),e.temp.textContent=be(L(c.temp(o))),e.ret.textContent=be(L("sensor-manifold_return_temperature")),e.valve.textContent=it(L(c.valve(o)));let i=e.badge;i.textContent=sa(r,a);let s=a?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";i.className="zd-badge"+(s?" "+s:""),e.toggle.classList.toggle("on",a),e.orip.textContent=$o(L(c.motorOpenRipples(o))),e.crip.textContent=$o(L(c.motorCloseRipples(o))),e.ofac.textContent=jo(L(c.motorOpenFactor(o))),e.cfac.textContent=jo(L(c.motorCloseFactor(o))),e.ph.textContent=na(L(c.preheatAdvance(o)));let p=String(D(c.motorLastFault(o))||"").toUpperCase(),l=p&&p!=="NONE"&&p!=="OK";e.fault.hidden=!l,l&&(e.faultVal.textContent=p)},incSetpoint(){let t=this.zone,e=L(c.setpoint(t))||20;Lt(t,Number((e+.5).toFixed(1)))},decSetpoint(){let t=this.zone,e=L(c.setpoint(t))||20;Lt(t,Number((e-.5).toFixed(1)))},toggleEnabled(){let t=this.zone,e=ee(c.enabled(t));no(t,!e)}},onMount(t,e){let o={title:e.querySelector(".zd-title"),setpoint:e.querySelector(".zd-setpoint"),temp:e.querySelector(".zd-temp"),ret:e.querySelector(".zd-ret"),valve:e.querySelector(".zd-valve"),badge:e.querySelector(".zd-badge"),toggle:e.querySelector(".btn-toggle"),inc:e.querySelector(".btn-inc"),dec:e.querySelector(".btn-dec"),orip:e.querySelector(".zd-orip"),crip:e.querySelector(".zd-crip"),ofac:e.querySelector(".zd-ofac"),cfac:e.querySelector(".zd-cfac"),ph:e.querySelector(".zd-ph"),fault:e.querySelector(".zd-fault"),faultVal:e.querySelector(".zd-fault-val")};o.inc.onclick=()=>t.incSetpoint(),o.dec.onclick=()=>t.decSetpoint(),o.toggle.onclick=()=>t.toggleEnabled();let r=()=>t.update(e,o),a=i=>{let s=B("selectedZone");(i===c.temp(s)||i===c.setpoint(s)||i===c.valve(s)||i===c.state(s)||i===c.enabled(s))&&r()};for(let i=1;i<=6;i++)S(c.temp(i),a),S(c.setpoint(i),a),S(c.valve(i),a),S(c.state(i),a),S(c.enabled(i),a),S(c.motorOpenRipples(i),r),S(c.motorCloseRipples(i),r),S(c.motorOpenFactor(i),r),S(c.motorCloseFactor(i),r),S(c.preheatAdvance(i),r),S(c.motorLastFault(i),r);S("sensor-manifold_return_temperature",r),q("selectedZone",r),C(e),r()}});var ia=`
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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  background: rgba(124,155,208,.12);
}
.zone-sensor-card .scan-msg {
  padding: 8px 10px;
  font-size: .8rem;
  color: var(--text-secondary);
  font-style: italic;
}
.zone-sensor-card .merge-visual {
  margin-top: 12px;
  padding: 12px;
  border: 1px solid rgba(255,133,49,.24);
  border-radius: 12px;
  background: rgba(255,133,49,.08);
}
.zone-sensor-card .merge-visual.is-solo {
  border-color: var(--panel-border);
  background: rgba(124,155,208,.07);
}
.zone-sensor-card .merge-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}
.zone-sensor-card .merge-pill {
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 10px;
  color: var(--text-strong);
  font-size: .82rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: rgba(0,19,29,.42);
}
.zone-sensor-card .merge-pill.secondary {
  border-color: rgba(122,167,206,.42);
}
.zone-sensor-card .merge-pill.primary {
  border-color: rgba(255,133,49,.52);
  color: var(--accent);
}
.zone-sensor-card .merge-link {
  width: 22px;
  height: 2px;
  flex: 0 0 22px;
  background: var(--accent);
  border-radius: 999px;
  position: relative;
  opacity: .9;
}
.zone-sensor-card .merge-link::before,
.zone-sensor-card .merge-link::after {
  content: '';
  position: absolute;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 12px rgba(255,133,49,.5);
}
.zone-sensor-card .merge-link::before { left: -1px; }
.zone-sensor-card .merge-link::after { right: -1px; }
.zone-sensor-card .merge-visual.is-solo .merge-link {
  background: rgba(120,146,200,.36);
}
.zone-sensor-card .merge-visual.is-solo .merge-link::before,
.zone-sensor-card .merge-visual.is-solo .merge-link::after {
  background: rgba(120,146,200,.42);
  box-shadow: none;
}
.zone-sensor-card .merge-caption {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: .74rem;
  line-height: 1.35;
}
`;A("zone-sensor-card",ia);var la=()=>{let t='<option value="None" data-i18n="common.none">None</option>';for(let e=1;e<=8;e++)t+='<option value="Probe '+e+'">Probe '+e+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.returnSensor">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${t}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.tempSource">Temperature Source</span>
        <span class="ui-field"><select class="ui-select zs-source"></select></span>
      </div>
      <div class="zs-row-ble">
        <div class="ui-section" data-i18n="zone.sensor.bleSensor">BLE Sensor</div>
        <div class="ui-note" data-i18n="zone.sensor.bleNote">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</div>
        <div class="ble-row">
          <input class="ble-input zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan" data-i18n="zone.sensor.scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="ui-divider"></div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="zone.sensor.mergeWith">Merge With Zone</span> <span class="ui-sublabel" data-i18n="zone.sensor.mergeHelp">merge into one room - mean temperature, valves open equally</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
      <div class="merge-visual is-solo" aria-live="polite">
        <div class="merge-rail"></div>
        <div class="merge-caption"></div>
      </div>
    </div>
  `};function Vo(t,e){let o=t.value,r='<option value="None" data-i18n="common.none">'+y("common.none")+"</option>";for(let a=1;a<=6;a++)a!==e&&(r+='<option value="Zone '+a+'">'+y("common.zone")+" "+a+"</option>");t.innerHTML=r,t.value=o||"None"}function ca(t){return t==="BLE"||t==="BLE Sensor"?"BLE Sensor":"Local Probe"}function da(t){return t==="BLE Sensor"?"BLE":"Local Probe"}function Go(t,e){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+y("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+y("zone.sensor.bleSource")+"</option>";t.innerHTML!==o&&(t.innerHTML=o),t.value=e}function Uo(t){let e=String(t||"").match(/\d+/);return e?Number(e[0]):0}var mi=T({tag:"zone-sensor-card",render:la,onMount(t,e){let o=e.querySelector(".zs-probe"),r=e.querySelector(".zs-source"),a=e.querySelector(".zs-ble"),i=e.querySelector(".zs-sync"),s=e.querySelector(".zs-row-ble"),p=e.querySelector(".zs-scan"),l=e.querySelector(".zs-scan-list"),g=e.querySelector(".merge-visual"),d=e.querySelector(".merge-rail"),b=e.querySelector(".merge-caption"),v=0;function f(){return B("selectedZone")}function m(){s.style.display=r.value==="BLE Sensor"?"":"none"}function _(){let h=f(),E=Uo(i.value),H=[];for(let N=1;N<=6;N++)N!==h&&Uo(D(c.syncTo(N)))===h&&H.push(N);let G=E>0&&E!==h,$=G||H.length>0;if(g.classList.toggle("is-solo",!$),!$){d.innerHTML='<span class="merge-pill primary">'+Y(h)+'</span><span class="merge-link"></span><span class="merge-pill">'+y("zone.sensor.noMerge")+"</span>",b.textContent=y("zone.sensor.soloCaption");return}if(G){d.innerHTML='<span class="merge-pill secondary">'+Y(h)+'</span><span class="merge-link"></span><span class="merge-pill primary">'+Y(E)+"</span>",b.textContent=y("zone.sensor.followsCaption",{zone:Y(h),target:Y(E)});return}let F='<span class="merge-pill primary">'+Y(h)+"</span>";for(let N of H)F+='<span class="merge-link"></span><span class="merge-pill secondary">'+Y(N)+"</span>";d.innerHTML=F,b.textContent=y("zone.sensor.primaryCaption",{zone:Y(h),zones:H.map(Y).join(", ")})}let u=ae(e);Go(r,"Local Probe"),u.select(o,{read:()=>D(c.probe(f()))||void 0,commit:h=>Oe(f(),"zone_probe",h)}),u.select(r,{read:()=>ca(String(D(c.tempSource(f()))||"")),commit:h=>Oe(f(),"zone_temp_source",da(h))}),u.select(i,{read:()=>D(c.syncTo(f()))||"None",commit:h=>Oe(f(),"zone_sync_to",h)});let w=u.text(a,{read:()=>D(c.ble(f()))||"",commit:h=>We(f(),"zone_ble_mac",h)});r.addEventListener("change",m),i.addEventListener("change",_);function k(){let h=f();v!==h?(Vo(i,h),v=h,l.style.display="none",u.discard()):u.refresh(),m(),_()}function z(h){let E=f();(h===c.probe(E)||h===c.tempSource(E)||h===c.syncTo(E)||h===c.ble(E)||/^select-zone_\d+_sync_to$/.test(h))&&(u.refresh(),m(),_())}p.addEventListener("click",()=>{if(p.disabled)return;p.disabled=!0,p.textContent="\u2026",l.style.display="",l.innerHTML='<div class="scan-msg">'+y("zone.sensor.scanning")+"</div>";let h=new AbortController,E=setTimeout(()=>h.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:h.signal}).then(H=>{if(!H.ok)throw new Error("HTTP "+H.status);return H.json()}).then(H=>{if(clearTimeout(E),p.disabled=!1,p.textContent=y("zone.sensor.scan"),!H.ok||!H.sensors||H.sensors.length===0){l.innerHTML='<div class="scan-msg">'+y("zone.sensor.noSensors")+"</div>";return}let G=f(),$=(D(c.ble(G))||"").toUpperCase(),F=M=>String(M).replace(/[&<>"']/g,W=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[W]),N="";for(let M of H.sensors){let W=M.mac.toUpperCase(),J=M.name?F(M.name):"",se=M.temp_c!=null?M.temp_c.toFixed(1)+"\xB0C":"\u2014",U=M.rssi!=null?M.rssi+" dBm":"",te=M.age_s<60?y("common.secondsAgo",{value:M.age_s}):y("common.minutesAgo",{value:Math.round(M.age_s/60)}),oe="";W===$?oe='<span class="ble-badge">'+y("zone.sensor.assignedThisZone")+"</span>":M.zone>0&&(oe='<span class="ble-badge">'+y("zone.sensor.zoneBadge",{zone:M.zone})+"</span>");let Q=J?`<div class="ble-mac">${J}</div><div class="ble-meta">${W}</div>`:`<div class="ble-mac">${W}</div>`;N+=`<div class="ble-scan-item">
              <div>
                ${Q}
                <div class="ble-meta">${se} &nbsp;${U} &nbsp;${te}</div>
                ${oe}
              </div>
              <button class="btn-assign" data-mac="${W}">${y("zone.sensor.assign")}</button>
            </div>`}l.innerHTML=N,l.querySelectorAll(".btn-assign").forEach(M=>{M.addEventListener("click",()=>{a.value=M.dataset.mac,w.markDirty(),l.style.display="none"})})}).catch(H=>{clearTimeout(E),p.disabled=!1,p.textContent=y("zone.sensor.scan");let G=H&&H.name==="AbortError"?y("zone.sensor.scanTimeout"):y("zone.sensor.scanFailed");l.innerHTML='<div class="scan-msg">'+G+"</div>"})}),q("selectedZone",k);for(let h=1;h<=6;h++)S(c.probe(h),z),S(c.tempSource(h),z),S(c.syncTo(h),z),S(c.ble(h),z);C(e),k()}});var pa=[0,.5,.7,.85,1];function ua(t){return pa[Math.min(t,4)]}var ga=`
.zone-room-card { height: 100%; }

.zone-room-card .wall-lbl-hint {
  font-size: .72rem;
  color: var(--text-faint);
  font-style: italic;
  margin: 2px 0 8px;
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
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;A("zone-room-card",ga);var ma=()=>`
  <div class="ui-card zone-room-card">
    <div class="ui-card-title" data-i18n="zone.room.title">Zone Settings</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.friendlyName">Friendly Name</span>
      <span class="ui-field"><input class="ui-input wide zr-friendly" maxlength="24" placeholder="e.g. Living Room" data-i18n-placeholder="zone.room.friendlyPlaceholder"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.area">Zone Area (m\xB2)</span>
      <span class="ui-field"><input class="ui-input zr-area" type="number" min="1" step="0.1" placeholder="m2"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.spacing">Pipe Spacing C-C (mm)</span>
      <span class="ui-field"><input class="ui-input zr-spacing" type="number" min="50" step="5" placeholder="200"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.pipeType">Pipe Type</span>
      <span class="ui-field"><select class="ui-select zr-pipe">
        <option>PEX 16mm</option><option>PEX 12mm</option><option>PEX 14mm</option><option>PEX 17mm</option><option>PEX 18mm</option><option>PEX 20mm</option><option>ALUPEX 16mm</option><option>ALUPEX 20mm</option><option>Unknown</option>
      </select></span>
    </div>

    <div class="ui-section" data-i18n="zone.room.exteriorWalls">Exterior Walls</div>
    <div class="wall-lbl-hint" data-i18n="zone.room.selectAll">Select all that apply</div>
    <div class="wall-btn-group">
      <button class="wall-btn" data-wall="None" data-i18n="common.none">None</button>
      <button class="wall-btn" data-wall="N">N</button>
      <button class="wall-btn" data-wall="S">S</button>
      <button class="wall-btn" data-wall="E">E</button>
      <button class="wall-btn" data-wall="W">W</button>
    </div>

    <div class="ui-divider"></div>
    <div class="ui-section" data-i18n="zone.room.forecastPreload">Forecast Preload</div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.windExposure">Wind Exposure</span>
      <span class="ui-field"><input class="ui-input zr-wind" type="number" min="0" max="1" step="0.05" placeholder="0.5"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.solarGain">Solar Gain</span>
      <span class="ui-field"><input class="ui-input zr-solar" type="number" min="0" max="1" step="0.05" placeholder="0.3"></span>
    </div>
    <div class="ui-row">
      <span class="ui-label" data-i18n="zone.room.thermalLead">Thermal Lead (h)</span>
      <span class="ui-field"><input class="ui-input zr-lead" type="number" min="0" max="48" step="1" placeholder="4"></span>
    </div>
    <div class="ui-note" data-i18n="zone.room.note">Wind exposure (0-1) is auto-seeded from the exterior walls above - edit it for a sheltered or extra-exposed site. Solar (0-1) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.</div>
  </div>
`,Si=T({tag:"zone-room-card",render:ma,onMount(t,e){let o=e.querySelector(".zr-friendly"),r=e.querySelector(".zr-area"),a=e.querySelector(".zr-spacing"),i=e.querySelector(".zr-pipe"),s=e.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),p=e.querySelector(".zr-wind"),l=e.querySelector(".zr-solar"),g=e.querySelector(".zr-lead");function d(){return B("selectedZone")}let b=ae(e);b.text(o,{read:()=>_e(d())||"",commit:w=>co(d(),w)}),b.num(r,{read:()=>L(c.area(d())),commit:w=>He(d(),"zone_area_m2",w)}),b.num(a,{read:()=>L(c.spacing(d())),commit:w=>He(d(),"zone_pipe_spacing_mm",w||200)}),b.select(i,{read:()=>D(c.pipeType(d()))||"Unknown",commit:w=>Oe(d(),"zone_pipe_type",w)});let v=b.num(p,{read:()=>L(c.windExposure(d())),commit:w=>He(d(),"zone_wind_exposure",w)});b.num(l,{read:()=>L(c.solarGain(d())),commit:w=>He(d(),"zone_solar_gain",w)}),b.num(g,{read:()=>L(c.thermalLeadH(d())),commit:w=>He(d(),"zone_thermal_lead_h",w)});let f=[];function m(){s.forEach(w=>{let k=w.dataset.wall;w.classList.toggle("active",k==="None"?f.length===0:f.includes(k))})}let _=b.custom({sync:()=>{let w=D(c.exteriorWalls(d()))||"None";f=w==="None"?[]:w.split(",").filter(Boolean),m()},commit:()=>We(d(),"zone_exterior_walls",f.length?f.join(","):"None")});s.forEach(w=>{w.addEventListener("click",()=>{let k=w.dataset.wall,z=f.slice();if(k==="None")z=[];else{let h=z.indexOf(k);h>=0?z.splice(h,1):z.push(k)}f=["N","S","E","W"].filter(h=>z.includes(h)),m(),_.markDirty(),p.value=String(ua(f.length)),v.markDirty()})});function u(w){let k=d();(w===c.area(k)||w===c.spacing(k)||w===c.pipeType(k)||w===c.exteriorWalls(k)||w===c.windExposure(k)||w===c.solarGain(k)||w===c.thermalLeadH(k))&&b.refresh()}q("selectedZone",b.discard),q("zoneNames",b.refresh);for(let w=1;w<=6;w++)S(c.area(w),u),S(c.spacing(w),u),S(c.pipeType(w),u),S(c.exteriorWalls(w),u),S(c.windExposure(w),u),S(c.solarGain(w),u),S(c.thermalLeadH(w),u);C(e),b.refresh()}});var ze=6,fa="#6E7E96",Ko="#5C6B85",ba="#7aa7ce",ha="#9DBC78",va="#FF8531",xa="#FFA600",ya="#7aa7ce",wa="#FFEAD2",za="#6E7E96",Xo="#B9CBD8",bt="#5C6B85",Wt="#A6B9C7",Jo="#A6B9C7",Yo="#7aa7ce",Sa="#66BB6A",_a="#FF6361",V={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,topBarY:0,topBarH:24,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},R={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},ka=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: var(--card);
}

.flow-svg {
  width: 100%;
  height: auto;
  display: block;
}

.flow-svg-mobile { display: none; }

.flow-zone-hit {
  transition: opacity .2s ease;
}

.flow-ribbon {
  transition: d .6s ease, opacity .35s ease;
}

.flow-metric {
  font-family: var(--mono);
  font-weight: 800;
}

@media (max-width: 760px) {
  .flow-svg-desktop { display: none; }
  .flow-svg-mobile { display: block; }
}
`;A("flow-diagram",ka);function La(t,e){let o=String(_e(t)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>e?r.slice(0,Math.max(1,e-1))+"\u2026":r}function Ca(t){if(!t)return null;let e=String(t).match(/(\d+)/);if(!e)return null;let o=Number(e[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Fa(t,e){return e?t==null||Number.isNaN(t)?Ko:t<.15?ba:t<.4?ha:t<.7?va:xa:fa}function Qo(t){let e=t==="desktop"?"0 1":"1 0",o=[];o.push("<defs>"),o.push('<pattern id="'+t+'-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="'+t+'-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="'+t+'-boxgrad" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(let r=1;r<=ze;r++)o.push('<linearGradient id="'+t+"-rg"+r+'" x1="0" y1="0" x2="'+e.split(" ")[0]+'" y2="'+e.split(" ")[1]+'">'),o.push('<stop id="'+t+"-rgs"+r+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="'+t+"-rga"+r+'" offset="100%" stop-color="#7aa7ce"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function ht(t,e,o){let r=V.boxX+V.boxW/2+(t-2.5)*V.srcSpread,a=V.srcY,i=V.zoneXs[t],s=V.zoneY-20,p=V.fanY,l=V.fanY+34;return"M"+(r-e).toFixed(1)+" "+a+" C"+(r-e).toFixed(1)+" "+p+" "+(i-o).toFixed(1)+" "+l+" "+(i-o).toFixed(1)+" "+s+" L"+(i+o).toFixed(1)+" "+s+" C"+(i+o).toFixed(1)+" "+l+" "+(r+e).toFixed(1)+" "+p+" "+(r+e).toFixed(1)+" "+a+"Z"}function vt(t,e,o){let r=R.midY+(t-2.5)*R.spread,a=R.zoneYs[t],i=R.endX-R.srcX,s=R.srcX+i*.34,p=R.srcX+i*.7;return"M"+R.srcX+" "+(r-e).toFixed(1)+" C"+s+" "+(r-e).toFixed(1)+" "+p+" "+(a-o).toFixed(1)+" "+R.endX+" "+(a-o).toFixed(1)+" L"+R.endX+" "+(a+o).toFixed(1)+" C"+p+" "+(a+o).toFixed(1)+" "+s+" "+(r+e).toFixed(1)+" "+R.srcX+" "+(r+e).toFixed(1)+"Z"}function er(t,e,o){return'<rect width="'+t+'" height="'+e+'" rx="22" fill="var(--card)"/><rect width="'+t+'" height="'+e+'" rx="22" fill="url(#'+o+'-fdots)" opacity="0.48"/><rect width="'+t+'" height="'+e+'" rx="22" fill="url(#'+o+'-fglow)"/>'}function tr(t){let e=t==="desktop"?V:R,o=t==="desktop"?e.boxY+27:e.boxY+29,r=t==="desktop"?e.boxY+56:e.boxY+58;return'<rect x="'+e.boxX+'" y="'+e.boxY+'" width="'+e.boxW+'" height="'+e.boxH+'" rx="7" fill="#ff8531"/><text id="'+t+'-fd-flow-label" x="'+(e.boxX+e.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(t==="desktop"?18:17)+'" font-weight="800" fill="var(--text-on-accent)" letter-spacing="2">'+y("overview.flowDiagram.flow")+'</text><text id="'+t+'-fd-flow-temp" class="flow-metric" x="'+(e.boxX+e.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(t==="desktop"?26:24)+'" fill="var(--text-on-accent)">---</text>'}function Ma(){let t=[],e=V.w,o=V.h,r=V.zoneY-20;t.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+e+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet">'),t.push(Qo("desktop")),t.push(er(e,o,"desktop")),t.push('<rect x="'+V.boxX+'" y="'+V.topBarY+'" width="'+V.boxW+'" height="'+V.topBarH+'" fill="url(#desktop-boxgrad)" rx="5"/>'),t.push(tr("desktop")),t.push('<text id="desktop-fd-ret-temp" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+20)+'" font-size="15" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+y("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="desktop-fd-dt-label" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+42)+'" font-size="12" font-weight="800" fill="'+Jo+'" letter-spacing="2">'+y("overview.flowDiagram.dt")+"</text>"),t.push('<text id="desktop-fd-dt" x="'+(V.boxX+V.boxW+24)+'" y="'+(V.boxY+65)+'" class="flow-metric" font-size="22" fill="#ff8531">---</text>');for(let a=1;a<=ze;a++)t.push('<path d="'+ht(a-1,V.srcHW,V.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let a=1;a<=ze;a++)t.push('<path id="desktop-fd-path-'+a+'" class="flow-ribbon" d="'+ht(a-1,V.srcHW,V.bgDstHW)+'" fill="url(#desktop-rg'+a+')" opacity="1"/>');t.push('<line x1="54" y1="'+r+'" x2="'+(e-54)+'" y2="'+r+'" stroke="#ff8531" stroke-width="2" opacity=".42"/>');for(let a=1;a<=ze;a++){let i=V.zoneXs[a-1];t.push('<g class="flow-zone-hit">'),t.push('<line x1="'+i+'" y1="'+(r-8)+'" x2="'+i+'" y2="'+(r+8)+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),t.push('<text id="desktop-fd-zn'+a+'" x="'+i+'" y="'+(r-13)+'" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z'+a+"</text>"),t.push('<text id="desktop-fd-zf'+a+'" x="'+i+'" y="'+(r+20)+'" text-anchor="middle" font-size="9.5" fill="#AFC1CD" font-weight="700" letter-spacing=".8">---</text>'),t.push('<text id="desktop-fd-zsp'+a+'" x="'+i+'" y="'+(r+20)+'" text-anchor="middle" font-size="9" fill="'+bt+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="desktop-fd-zt'+a+'" x="'+i+'" y="'+(r+42)+'" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---\xB0C</text>'),t.push('<text id="desktop-fd-zv'+a+'" x="'+(i-28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---%</text>'),t.push('<text id="desktop-fd-zr'+a+'" x="'+(i+28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C3D0D9">---</text>'),t.push("</g>")}return t.push("</svg>"),t.join("")}function Aa(){let t=[],e=R.w,o=R.h;t.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+e+" "+o+'" preserveAspectRatio="xMidYMid meet">'),t.push(Qo("mobile")),t.push(er(e,o,"mobile")),t.push('<rect x="0" y="'+R.boxY+'" width="'+(R.boxX-6)+'" height="'+R.boxH+'" fill="url(#mobile-boxgrad)" rx="4"/>'),t.push(tr("mobile"));for(let r=1;r<=ze;r++)t.push('<path d="'+vt(r-1,R.srcHW,R.bgDstHW)+'" fill="#021824" opacity="0.9"/>');for(let r=1;r<=ze;r++)t.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+vt(r-1,R.srcHW,R.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');t.push('<rect x="'+(R.boxX+9)+'" y="'+(R.boxY+R.boxH+9)+'" width="'+(R.boxW-18)+'" height="60" rx="8" fill="rgba(2,29,43,.74)"/>'),t.push('<text id="mobile-fd-ret-temp" x="'+(R.boxX+R.boxW/2)+'" y="'+(R.boxY+R.boxH+27)+'" text-anchor="middle" font-size="12.5" font-weight="800" fill="#7aa7ce" font-family="var(--mono)">'+y("overview.flowDiagram.returnShort")+" ---</text>"),t.push('<text id="mobile-fd-dt-label" x="'+(R.boxX+R.boxW/2)+'" y="'+(R.boxY+R.boxH+43)+'" text-anchor="middle" font-size="9.5" font-weight="800" fill="'+Jo+'" letter-spacing="1.1">'+y("overview.flowDiagram.dt")+"</text>"),t.push('<text id="mobile-fd-dt" x="'+(R.boxX+R.boxW/2)+'" y="'+(R.boxY+R.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>'),t.push('<line x1="'+R.endX+'" y1="34" x2="'+R.endX+'" y2="'+(o-34)+'" stroke="#ff8531" stroke-width="2" opacity=".48"/>'),t.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="10" fill="'+Wt+'" font-weight="700" letter-spacing="1.5">'+y("overview.graph.layers.temp").toUpperCase()+"</text>"),t.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="10" fill="'+Wt+'" font-weight="700" letter-spacing="1.5">'+y("overview.flowDiagram.flow")+"</text>"),t.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="10" fill="'+Wt+'" font-weight="700" letter-spacing="1.5">'+y("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=ze;r++){let a=R.zoneYs[r-1];t.push('<line x1="'+(R.endX-8)+'" y1="'+a+'" x2="'+(R.endX+8)+'" y2="'+a+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),t.push('<text id="mobile-fd-zn'+r+'" x="'+(R.endX-14)+'" y="'+(a+4)+'" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z'+r+"</text>"),t.push('<text id="mobile-fd-zf'+r+'" x="'+R.nameX+'" y="'+(a-8)+'" text-anchor="middle" font-size="9" fill="#AFC1CD" font-weight="700" letter-spacing=".7">---</text>'),t.push('<text id="mobile-fd-zsp'+r+'" x="'+R.nameX+'" y="'+(a+7)+'" text-anchor="middle" font-size="8.5" fill="'+bt+'" font-weight="600" font-family="var(--mono)"></text>'),t.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#F6ECE0">---\xB0C</text>'),t.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---%</text>'),t.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(a+4)+'" class="flow-metric" font-size="13.5" fill="#C3D0D9">---</text>')}return t.push("</svg>"),t.join("")}var Ea=()=>'<div class="flow-wrap">'+Ma()+Aa()+"</div>";T({tag:"flow-diagram",render:Ea,onMount(t,e){let o=["desktop","mobile"],r={};o.forEach(g=>{r[g]={flowEl:e.querySelector("#"+g+"-fd-flow-temp"),flowLabelEl:e.querySelector("#"+g+"-fd-flow-label"),retEl:e.querySelector("#"+g+"-fd-ret-temp"),dtLabelEl:e.querySelector("#"+g+"-fd-dt-label"),dtEl:e.querySelector("#"+g+"-fd-dt"),zones:new Array(ze+1)};for(let d=1;d<=ze;d++)r[g].zones[d]={textTemp:e.querySelector("#"+g+"-fd-zt"+d),textSetpoint:e.querySelector("#"+g+"-fd-zsp"+d),textFlow:e.querySelector("#"+g+"-fd-zv"+d),textRet:e.querySelector("#"+g+"-fd-zr"+d),label:e.querySelector("#"+g+"-fd-zn"+d),friendly:e.querySelector("#"+g+"-fd-zf"+d),path:e.querySelector("#"+g+"-fd-path-"+d)}});function a(g,d){g&&(g.textContent=d)}function i(g,d,b,v,f){let m=r[g];a(m.flowLabelEl,y("overview.flowDiagram.flow")),a(m.flowEl,be(d)),a(m.retEl,y("overview.flowDiagram.returnShort")+" "+be(b)),a(m.dtLabelEl,y("overview.flowDiagram.dt")),a(m.dtEl,v==null?"---":v.toFixed(1)+"\xB0C"),m.dtEl&&m.dtEl.setAttribute("fill",f)}function s(){a(e.querySelector("#mobile-fd-temp-head"),y("overview.graph.layers.temp").toUpperCase()),a(e.querySelector("#mobile-fd-flow-head"),y("overview.flowDiagram.flow")),a(e.querySelector("#mobile-fd-ret-head"),y("overview.flowDiagram.returnShort"))}function p(g,d,b){let v=r[g].zones[d];if(!v)return;let{enabled:f,pct:m,temp:_,setpoint:u,valve:w,returnTemp:k,hasReturn:z}=b,h=La(d,g==="desktop"?11:12),E=be(_),H=u!=null?be(u):"";a(v.label,"Z"+d),a(v.friendly,g==="desktop"?(h||"---")+(H?" ("+H+")":""):h||"---"),a(v.textTemp,E),a(v.textSetpoint,g==="desktop"?"":H?"("+H+")":""),a(v.textFlow,it(w)),a(v.textRet,z?be(k):"---"),v.label.setAttribute("fill",f?wa:za),v.friendly.setAttribute("fill",f?Xo:bt),v.textSetpoint.setAttribute("fill",f?Xo:bt),v.textFlow.setAttribute("fill",Fa(m,f)),v.textRet.setAttribute("fill",z&&f?ya:Ko);let G=v.path;if(!f)G.setAttribute("d",g==="desktop"?ht(d-1,1,2):vt(d-1,1,2)),G.setAttribute("fill","#021824"),G.setAttribute("opacity","0.38");else{let $=g==="desktop"?V:R,F=Math.max(2.5,m*$.bgDstHW),N=Math.max(1.3,m*$.srcHW);G.setAttribute("d",g==="desktop"?ht(d-1,N,F):vt(d-1,N,F)),G.setAttribute("fill","url(#"+g+"-rg"+d+")"),G.setAttribute("opacity","1")}}function l(){let g=L(n.flow),d=L(n.ret),b=g!=null&&d!=null?Number(g)-Number(d):null,v=b==null||b<3?Yo:b>8?_a:Sa;o.forEach(f=>i(f,g,d,b,v));for(let f=1;f<=ze;f++){let m=L(c.temp(f)),_=L(c.setpoint(f)),u=L(c.valve(f)),w=ee(c.enabled(f)),k=String(D(c.tempSource(f))||"Local Probe"),z=Ca(D(c.probe(f))||""),h=z?L(c.probeTemp(z)):null,E=k!=="Local Probe"&&h!=null&&!Number.isNaN(Number(h)),H=u!=null?Math.max(0,Math.min(100,Number(u)))/100:0,G={enabled:w,pct:H,temp:m,setpoint:_,valve:u,returnTemp:h,hasReturn:E};o.forEach($=>p($,f,G))}}S(n.flow,l),S(n.ret,l),q("zoneNames",l);for(let g=1;g<=ze;g++)S(c.temp(g),l),S(c.setpoint(g),l),S(c.valve(g),l),S(c.enabled(g),l),S(c.probe(g),l),S(c.tempSource(g),l);for(let g=1;g<=8;g++)S(c.probeTemp(g),l);s(),l()}});var Na=48,Ta=1e3,Zt="#ff8531",xt="#7aa7ce",jt="#ffce5b",Da=2,wt=1e3,or=220,Ae=46,Pa=52,me=14,Ra=44,yt=wt-Ae-Pa,Se=or-me-Ra,Me=me+Se,Oa=`
.forecast-preview .fc-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 2px 0 6px;
}
.forecast-preview .fc-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 4px 10px;
  font-size: .68rem;
  font-weight: 700;
  letter-spacing: .3px;
  cursor: pointer;
  transition: background .14s ease, border-color .14s ease, color .14s ease, opacity .14s ease;
}
.forecast-preview .fc-toggle::before {
  content: '';
  width: 9px;
  height: 9px;
  border-radius: 999px;
  border: 2px solid currentColor;
  background: color-mix(in srgb, currentColor 30%, transparent);
  flex-shrink: 0;
}
.forecast-preview .fc-toggle:hover {
  border-color: rgba(255,133,49,.44);
  color: var(--text-strong);
}
.forecast-preview .fc-toggle.is-off {
  opacity: .48;
  background: transparent;
}
.forecast-preview .fc-toggle[data-layer="temp"] { color: var(--series-warm); }
.forecast-preview .fc-toggle[data-layer="wind"] { color: var(--series-cool); }
.forecast-preview .fc-toggle[data-layer="solar"] { color: var(--series-solar); }
.forecast-preview .fc-wind-guide {
  opacity: .58;
}
.forecast-preview .fc-wind-arrow {
  fill: var(--series-cool);
  stroke: var(--overlay-bg-soft);
  stroke-width: .28;
  stroke-linejoin: round;
  opacity: .88;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 2px rgba(122,167,206,.22));
}
.forecast-preview .fc-wind-arrow.now {
  fill: var(--series-solar);
}
`;A("monitor-forecast-preview",Oa);var Ha=()=>`
  <div class="chart-card forecast-preview">
    <div class="chart-head">
      <span class="chart-title" data-i18n="overview.weather.title">Weather Forecast</span>
      <span class="chart-sub"></span>
    </div>
    <div class="fc-controls" role="toolbar" aria-label="Forecast chart layers" data-i18n-label="overview.graph.layers.forecast">
      <button type="button" class="fc-toggle" data-layer="temp" aria-pressed="true" data-i18n="overview.graph.layers.temp">Temp</button>
      <button type="button" class="fc-toggle" data-layer="wind" aria-pressed="true" data-i18n="overview.graph.layers.windDir">Wind + dir</button>
      <button type="button" class="fc-toggle" data-layer="solar" aria-pressed="true" data-i18n="overview.graph.layers.solar">Solar</button>
    </div>
    <div class="fc-body"></div>
  </div>
`;function qa(t){if(!t)return y("common.noData");if(t<16e8)return y("common.clockSyncing");let e=new Date(t*1e3),o=e.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),r=new Date,a=e.getFullYear()===r.getFullYear()&&e.getMonth()===r.getMonth()&&e.getDate()===r.getDate();return y("overview.weather.updated",{time:a?o:e.toLocaleDateString([],{month:"short",day:"numeric"})+" "+o})}function Ia(t){return Number.isFinite(Number(t))?["N","NE","E","SE","S","SW","W","NW"][Math.round((Number(t)%360+360)%360/45)%8]:"---"}function Ba(t){if(!Number.isFinite(Number(t)))return"---";let e=Math.round((Number(t)%360+360)%360);return Ia(e)+" "+e+"\xB0"}function Wa(t,e){let o=t.hours.slice(0,Na),r=o.length,a=o.map(z=>z[0]),i=o.map(z=>z[1]),s=o.map(z=>z[2]),p=o.map(z=>z[3]||0),l=Fo(a,0,10),g=Math.max(2,...i)*1.15,d=z=>Ae+(r<=1?0:z/(r-1)*yt),b=z=>me+(1-(z-l.min)/(l.max-l.min))*Se,v=z=>me+(1-z/g)*Se,f=z=>me+(1-Math.max(0,Math.min(1,z/Ta)))*Se,m=Z("svg",{viewBox:`0 0 ${wt} ${or}`,preserveAspectRatio:"xMidYMid meet"});for(let z=0;z<4;z++){let h=z/3,E=me+h*Se;m.appendChild(Z("line",{x1:Ae,y1:E,x2:Ae+yt,y2:E,class:"chart-grid"})),e.temp&&m.appendChild(Z("text",{x:Ae-7,y:E+4,"text-anchor":"end",class:"chart-tick"},(l.max-(l.max-l.min)*h).toFixed(0)+"\xB0")),e.wind&&m.appendChild(Z("text",{x:Ae+yt+7,y:E+4,"text-anchor":"start",class:"chart-tick"},(g-g*h).toFixed(0)))}if(m.appendChild(Z("line",{x1:Ae,y1:Me,x2:Ae+yt,y2:Me,class:"chart-axis"})),e.temp&&m.appendChild(Z("text",{x:12,y:me+Se/2,transform:`rotate(-90 12 ${(me+Se/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"\xB0C")),e.wind&&m.appendChild(Z("text",{x:wt-12,y:me+Se/2,transform:`rotate(90 ${wt-12} ${(me+Se/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"m/s")),e.solar){let z="";for(let h=0;h<r;h++)z+=(h?" L ":"M ")+d(h).toFixed(1)+" "+f(p[h]).toFixed(1);z&&(z+=` L ${d(r-1).toFixed(1)} ${Me} L ${d(0).toFixed(1)} ${Me} Z`,m.appendChild(Z("path",{d:z,fill:"color-mix(in srgb, var(--series-solar) 18%, transparent)",stroke:"none"})))}let _=t.base_epoch?Math.floor((Date.now()/1e3-t.base_epoch)/3600):-1,u=new Date(t.base_epoch*1e3).getDate(),w=-1;for(let z=0;z<r;z++){let h=new Date((t.base_epoch+z*3600)*1e3),E=z===_,H=h.getDate()!==u;H&&w<0&&h.getHours()===0&&(w=z);let G=d(z),$=Me+13;m.appendChild(Z("text",{x:G,y:$,"text-anchor":"end",transform:`rotate(-45 ${G.toFixed(1)} ${$})`,class:"chart-hour"+(E?" now":H?" day2":"")},String(h.getHours()).padStart(2,"0"))),E&&(m.appendChild(Z("line",{x1:G,y1:me,x2:G,y2:Me,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"})),m.appendChild(Z("text",{x:G+4,y:me+11,"text-anchor":"start",class:"chart-hour now"},"now")))}if(w>0){let z=d(w);m.appendChild(Z("line",{x1:z,y1:me,x2:z,y2:Me,stroke:"rgba(202,219,248,.26)","stroke-width":"1","stroke-dasharray":"4 4","vector-effect":"non-scaling-stroke"})),m.appendChild(Z("text",{x:z+4,y:me+11,"text-anchor":"start",class:"chart-hour day2"},"+1d"))}if(e.wind){m.appendChild(Z("path",{d:qe(i.map((h,E)=>({x:d(E),y:v(h)}))),class:"fc-wind-guide",fill:"none",stroke:xt,"stroke-width":"1.5","stroke-linejoin":"round","stroke-linecap":"round"}));let z=Z("g",{class:"fc-wind-arrows","aria-label":y("overview.weather.windArrows")});for(let h=0;h<r;h++){if(h%Da!==0&&h!==_)continue;let E=Number(s[h]);if(!Number.isFinite(E))continue;let H=d(h),G=v(i[h]);z.appendChild(Z("path",{d:"M -4.8 -1.1 L .7 -1.1 L .7 -3.6 L 5.6 0 L .7 3.6 L .7 1.1 L -4.8 1.1 Z",class:"fc-wind-arrow"+(h===_?" now":""),transform:`translate(${H.toFixed(1)} ${G.toFixed(1)}) rotate(${(E-90).toFixed(1)})`}))}m.appendChild(z)}e.temp&&m.appendChild(Z("path",{d:qe(a.map((z,h)=>({x:d(h),y:b(z)}))),fill:"none",stroke:Zt,"stroke-width":"2.6","stroke-linejoin":"round","stroke-linecap":"round"})),e.solar&&m.appendChild(Z("path",{d:qe(p.map((z,h)=>({x:d(h),y:f(z)}))),fill:"none",stroke:jt,"stroke-width":"1.8","stroke-linejoin":"round","stroke-linecap":"round",opacity:".85"}));let k=[];return e.temp&&k.push(z=>({y:b(a[z]),color:Zt})),e.wind&&k.push(z=>({y:v(i[z]),color:xt})),e.solar&&k.push(z=>({y:f(p[z]),color:jt})),{svg:m,model:{count:r,plotTop:me,plotBottom:Me,xAt:d,label:z=>String(new Date((t.base_epoch+z*3600)*1e3).getHours()).padStart(2,"0")+":00",dots:z=>k.map(h=>h(z)),rows:z=>{let h=[];return e.temp&&h.push({color:Zt,label:y("overview.graph.layers.temp"),value:a[z].toFixed(1)+"\xB0"}),e.wind&&(h.push({color:xt,label:y("overview.graph.layers.windDir"),value:i[z].toFixed(1)+" m/s"}),h.push({color:xt,label:y("overview.weather.tooltip.from"),value:Ba(s[z])})),e.solar&&h.push({color:jt,label:y("overview.graph.layers.solar"),value:Math.round(p[z])+" W/m\xB2"}),h}}}}var Ri=T({tag:"monitor-forecast-preview",render:Ha,onMount(t,e){let o=e.querySelector(".chart-sub"),r=e.querySelector(".fc-body"),a=e.matches(".forecast-preview")?e:e.querySelector(".forecast-preview"),i=Array.from(e.querySelectorAll(".fc-toggle")),s={temp:!0,wind:!0,solar:!0},p=null;function l(){i.forEach(d=>{let b=d.dataset.layer;d.classList.toggle("is-off",!s[b]),d.setAttribute("aria-pressed",s[b]?"true":"false")})}function g(){p&&(p(),p=null);let d=et(),b=d&&Array.isArray(d.hours)?d.hours:[];if(!(d?d.count||b.length:0)||!b.length||!d.base_epoch){o.textContent=y("common.noData"),r.innerHTML='<div style="color:var(--text-secondary);font-size:.8rem;text-align:center;padding:34px">'+y("overview.weather.notFetched")+"</div>";return}o.textContent=qa(d.fetch_epoch),r.innerHTML="";let{svg:f,model:m}=Wa(d,s);r.appendChild(f),p=ct(f,a,m)}i.forEach(d=>{d.addEventListener("click",()=>{let b=d.dataset.layer;s[b]=!s[b],l(),g()})}),q("forecastHours",g),C(e),l(),g()}});var Za={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#7aa7ce"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},ja=`
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
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.logs-stream::-webkit-scrollbar { width: 6px; }
.logs-stream::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }

.logs-empty { color: var(--text-secondary); font-size: .78rem; text-align: center; padding: 24px; }

.log-line {
  display: grid;
  grid-template-columns: 20px 104px 1fr;
  gap: 8px;
  padding: 3px 12px;
  font-size: .84rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}
.log-line .lv { font-weight: 800; text-align: center; }
.log-line .tag { color: var(--accent); opacity: .85; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.log-line .msg { color: var(--text-strong); opacity: .92; }
`;A("logs-view",ja);var $a=()=>`
  <div class="logs-view">
    <div class="card-title">
      <span data-i18n="logs.deviceLogs">Device Logs</span>
      <div class="actions">
        <button class="btn pause-btn" type="button" data-i18n="logs.pause">Pause</button>
        <button class="btn clear-btn" type="button" data-i18n="logs.clear">Clear</button>
      </div>
    </div>
    <div class="logs-stream"></div>
  </div>
`;function Va(t){let e=Za[t.level]||{label:"?",color:"var(--text-secondary)"},o=rr(t.tag||""),r=rr(t.msg||"");return'<div class="log-line"><span class="lv" style="color:'+e.color+'">'+e.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function rr(t){return String(t).replace(/[&<>]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[e])}var Wi=T({tag:"logs-view",render:$a,onMount(t,e){let o=e.querySelector(".logs-stream"),r=e.querySelector(".pause-btn"),a=e.querySelector(".clear-btn"),i=!1;function s(){if(i)return;let p=Qt();if(!p||!p.length){o.innerHTML='<div class="logs-empty">'+y("logs.waiting")+"</div>";return}let l=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=p.map(Va).join(""),l&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{i=!i,r.textContent=i?y("logs.resume"):y("logs.pause"),r.classList.toggle("on",i),i||s()}),a.addEventListener("click",()=>{eo()}),q("deviceLog",s),C(e),s()}});var Ga=`
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
.btn:hover { background: var(--control-bg-hover); border-color: rgba(255,133,49,.5); color: #ffe7b9; }
.diag-i2c .fault {
    color: var(--red);
    font-weight: bold;
}`;A("diag-i2c",Ga);var Ua=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,Xi=T({tag:"diag-i2c",render:Ua,onMount(t,e){let o=e.querySelector("#i2c-result");function r(){o.textContent=B("i2cResult")||y("diagnostics.i2c.empty")}e.querySelector("#btn-i2c-scan").addEventListener("click",()=>{io()}),q("i2cResult",r),C(e),r()}});var Xa=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid var(--danger-border-soft);
  background: var(--danger-bg);
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
  box-shadow: 0 0 10px var(--danger-border);
}

.diag-manual-text {
  color: var(--danger-text);
  font-size: .8rem;
  font-weight: 700;
  letter-spacing: .35px;
  text-transform: uppercase;
}
`;A("diag-manual-badge",Xa);var Ya=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,tl=T({tag:"diag-manual-badge",render:Ya,onMount(t,e){let o=e.classList.contains("diag-manual-badge")?e:e.querySelector(".diag-manual-badge");function r(){let a=!!B("manualMode");o&&o.classList.toggle("on",a)}q("manualMode",r),C(e),r()}});var Ka=`
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
  display: grid;
  grid-template-columns: minmax(104px, 140px) minmax(0, 1fr);
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
  min-width: 0;
}
.diag-zone-motor .cfg-row.manual-row {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 8px 0 12px;
  border-bottom: 1px solid var(--panel-border);
  margin-bottom: 14px;
}
.diag-zone-motor .manual-note {
  color: var(--text-secondary);
  font-size: .82rem;
  font-weight: 600;
  min-width: 0;
}
.diag-zone-motor .lbl {
  font-weight: 600;
  color: var(--text);
  min-width: 0;
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
  width: 100%;
  min-width: 0;
  transition: border-color .15s ease;
}
.diag-zone-motor .sel:focus {
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
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
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
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
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.diag-zone-motor .btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.diag-zone-motor .btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
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
  background: var(--control-knob);
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: var(--control-border-strong);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: var(--text-on-accent);
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
`;A("diag-zone-motor",Ka);var Ja=t=>{let e=t.zone||B("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===e?" selected":"")+">"+y("common.zone")+" "+r+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title" data-i18n="diagnostics.motor.title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note" data-i18n="diagnostics.motor.manualNote">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" data-i18n-label="diagnostics.motor.manualNote" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl" data-i18n="diagnostics.motor.motor">Motor</span>
          <select class="sel motor-zone-select">${o}</select>
        </div>
        <div class="cfg-row">
          <span class="lbl" data-i18n="diagnostics.motor.target">Motor Target</span>
          <div class="mn-wrap">
            <input type="number" class="mn-inp motor-target-input" min="0" max="100" step="1" value="0">
            <span class="mn-unit">%</span>
          </div>
        </div>
        <div class="btn-row">
          <button class="btn motor-open-btn" data-i18n="diagnostics.motor.open10">Open 10s</button>
          <button class="btn motor-close-btn" data-i18n="diagnostics.motor.close10">Close 10s</button>
          <button class="btn warn motor-stop-btn" data-i18n="diagnostics.motor.stop">Stop</button>
        </div>
      </div>
    </div>
  `},cl=T({tag:"diag-zone-motor-card",render:Ja,onMount(t,e){let o=Number(t.zone||B("selectedZone")||1),r=!!B("manualMode"),a=e.querySelector(".manual-mode-toggle"),i=e.querySelector(".motor-gated"),s=e.querySelector(".motor-zone-select"),p=e.querySelector(".motor-target-input"),l=e.querySelector(".motor-open-btn"),g=e.querySelector(".motor-close-btn"),d=e.querySelector(".motor-stop-btn"),b=()=>{let _=s.value||String(o),u="";for(let w=1;w<=6;w++)u+='<option value="'+w+'">'+y("common.zone")+" "+w+"</option>";s.innerHTML=u,s.value=_};function v(_){r=!!_,a&&(a.classList.toggle("on",r),a.setAttribute("aria-checked",r?"true":"false")),i&&i.classList.toggle("locked",!r),[s,p,l,g,d].forEach(u=>{u&&(u.disabled=!r)})}function f(){let _=!r;if(v(_),_){Ft(!0);for(let u=1;u<=6;u++)Ct(u)}else Ft(!1)}function m(){let _=L(c.motorTarget(o));p&&_!=null?p.value=Number(_).toFixed(0):p&&(p.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),m()}),a==null||a.addEventListener("click",f),a==null||a.addEventListener("keydown",_=>{_.key!==" "&&_.key!=="Enter"||(_.preventDefault(),f())});for(let _=1;_<=6;_++)S(c.motorTarget(_),m);m(),v(r),q("manualMode",()=>{v(!!B("manualMode"))}),C(e),p==null||p.addEventListener("change",_=>{if(!r)return;let u=_.target.value;po(o,u)}),l==null||l.addEventListener("click",()=>{r&&uo(o,1e4)}),g==null||g.addEventListener("click",()=>{r&&go(o,1e4)}),d==null||d.addEventListener("click",()=>{r&&Ct(o)})}});var Qa=`
.diag-zone-recovery {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 18px;
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
.diag-zone-recovery .recovery-status {
  margin-top: 10px;
  font-size: .78rem;
  font-weight: 600;
  min-height: 1.1em;
  opacity: 0;
  transition: opacity .15s ease;
}
.diag-zone-recovery .recovery-status.show { opacity: 1; }
.diag-zone-recovery .recovery-status.ok { color: var(--state-ok); }
.diag-zone-recovery .recovery-status.err { color: var(--state-danger); }
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
  outline: 2px solid var(--focus-ring-soft);
  outline-offset: 1px;
  border-color: var(--focus-border);
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
  border-color: var(--accent-border-hover);
  color: var(--accent-text-soft);
}
.diag-zone-recovery .btn.warn {
  background: var(--danger-bg);
  border-color: var(--danger-border-soft);
  color: var(--danger-text);
}
.diag-zone-recovery .btn.warn:hover {
  background: linear-gradient(135deg, var(--danger-bg-strong), var(--danger-bg-soft));
  border-color: var(--danger-border);
}
`;A("diag-zone-recovery",Qa);var en=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title" data-i18n="diagnostics.recovery.title">Faults &amp; Relearn</div>
      <div class="recovery-note" data-i18n="diagnostics.recovery.note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn" data-i18n="diagnostics.recovery.resetFault">Reset Fault</button>
        <button class="btn warn recovery-factors-btn" data-i18n="diagnostics.recovery.resetFactors">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn" data-i18n="diagnostics.recovery.resetRelearn">Reset + Relearn</button>
      </div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,bl=T({tag:"diag-zone-recovery-card",render:en,onMount(t,e){let o=Number(B("selectedZone")||1),r=e.querySelector(".recovery-fault-btn"),a=e.querySelector(".recovery-factors-btn"),i=e.querySelector(".recovery-relearn-btn"),s=e.querySelector(".recovery-status");q("selectedZone",()=>{o=Number(B("selectedZone")||1)});let p=null;function l(d,b){s.textContent=d,s.className="recovery-status show "+(b?"ok":"err"),clearTimeout(p),p=setTimeout(()=>{s.classList.remove("show")},4e3)}function g(d,b){let v=d(o);l(b,!0),v&&typeof v.then=="function"&&v.then(f=>{f&&f.ok===!1&&l(y("diagnostics.recovery.rejected"),!1)}).catch(()=>l(y("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{g(mo,"\u2713 "+y("diagnostics.recovery.faultSent",{zone:Y(o)}))}),a==null||a.addEventListener("click",()=>{confirm(y("diagnostics.recovery.confirmFactors",{zone:Y(o)}))&&g(fo,"\u2713 "+y("diagnostics.recovery.factorsReset",{zone:Y(o)}))}),i==null||i.addEventListener("click",()=>{confirm(y("diagnostics.recovery.confirmRelearn",{zone:Y(o)}))&&g(bo,"\u2713 "+y("diagnostics.recovery.relearnStarted",{zone:Y(o)}))}),C(e)}});var tn=`
.diag-system-card .sys-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 4px;
}
.diag-system-card .sys-cell { display: flex; flex-direction: column; gap: 4px; }
.diag-system-card .sys-label {
  color: var(--text-secondary); font-size: .64rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px;
}
.diag-system-card .sys-value {
  font-family: var(--mono); font-size: 1.5rem; font-weight: 800;
  color: var(--text-strong); line-height: 1;
}
.diag-system-card .sys-value.warn { color: #FFB4B4; }
.diag-system-card .sys-bar {
  height: 4px; border-radius: 3px; margin-top: 6px;
  background: var(--control-bg-hover); overflow: hidden;
}
.diag-system-card .sys-bar > i {
  display: block; height: 100%; width: 0%;
  background: linear-gradient(90deg, #6FCF97, #F2C94C, #EB5757);
  background-size: 300% 100%; background-position: 0% 0;
  transition: width .4s ease;
}
.diag-system-card .sys-dump { width: 100%; margin-top: 14px; }
`;A("diag-system-card",tn);var on=()=>`
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.system.title">System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu0">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.cpu1">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.heap">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label" data-i18n="diagnostics.system.psram">Free PSRAM</div>
        <div class="sys-value" data-k="psram">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button" data-i18n="diagnostics.system.dump">Dump task stats to log</button>
    <div class="ui-note" data-i18n="diagnostics.system.note">Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.</div>
  </div>
`,_l=T({tag:"diag-system-card",render:on,onMount(t,e){let o=e.querySelector('[data-k="cpu0"]'),r=e.querySelector('[data-k="cpu1"]'),a=e.querySelector('[data-k="heap"]'),i=e.querySelector('[data-k="psram"]'),s=e.querySelector('[data-bar="cpu0"]'),p=e.querySelector('[data-bar="cpu1"]'),l=(b,v,f)=>{if(f==null||!Number.isFinite(Number(f))){b.textContent="\u2014",b.classList.remove("warn"),v.style.width="0%";return}let m=Math.max(0,Math.min(100,Number(f)));b.textContent=m.toFixed(0)+"%",b.classList.toggle("warn",m>=90),v.style.width=m+"%",v.style.backgroundPosition=m+"% 0"},g=(b,v,f)=>{if(v==null||!Number.isFinite(Number(v))){b.textContent="\u2014";return}let m=Number(v);b.textContent=m+" KB",b.classList.toggle("warn",f!=null&&m<f)},d=()=>{l(o,s,L(n.cpuLoadCore0)),l(r,p,L(n.cpuLoadCore1)),g(a,L(n.freeInternalKb),48),g(i,L(n.freePsramKb),null)};e.querySelector(".sys-dump").addEventListener("click",()=>{vo().catch(b=>console.error("[System] dump failed:",b))}),S(n.cpuLoadCore0,d),S(n.cpuLoadCore1,d),S(n.freeInternalKb,d),S(n.freePsramKb,d),C(e),d()}});var rn=`
.asgard-bridge-status-card .bridge-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}
.asgard-bridge-status-card .role-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
}
.asgard-bridge-status-card .role-badge.master {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border: 1px solid rgba(100,255,100,.35);
}
.asgard-bridge-status-card .role-badge.slave {
  background: rgba(70,70,70,.28);
  color: #ADADAD;
  border: 1px solid rgba(150,150,150,.25);
}
.asgard-bridge-status-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
  margin-bottom: 12px;
}
.asgard-bridge-status-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
  font-family: var(--mono);
}
.asgard-bridge-status-card .status-grid {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 6px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}
.asgard-bridge-status-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
  min-width: 0;
}
.asgard-bridge-status-card .status-grid .val.warn { color: #FFE9A0; }
`;A("asgard-bridge-status-card",rn);var an=()=>`
  <div class="ui-card asgard-bridge-status-card">
    <div class="bridge-head">
      <div class="ui-card-title" data-i18n="diagnostics.asgard.title">Bridge Status</div>
      <span class="role-badge slave">slave</span>
    </div>
    <div class="setpoint-box">
      <span class="setpoint-val ab-setpoint">\u2014</span>
      <span class="ui-note" data-i18n="diagnostics.asgard.setpointNote">Recommended virtual thermostat setpoint, derived from enabled zone targets.</span>
    </div>
    <div class="status-grid">
      <span data-i18n="diagnostics.asgard.peer">Peer</span><span class="val ab-peer">n/a</span>
      <span data-i18n="diagnostics.asgard.lastPush">Last push</span><span class="val ab-push">\u2014</span>
      <span data-i18n="diagnostics.asgard.zonesWeighted">Zones weighted</span><span class="val ab-zones">\u2014</span>
      <span data-i18n="diagnostics.asgard.lastError">Last error</span><span class="val ab-error">\u2014</span>
    </div>
  </div>
`,El=T({tag:"asgard-bridge-status-card",render:an,onMount(t,e){let o=e.querySelector(".role-badge"),r=e.querySelector(".ab-peer"),a=e.querySelector(".ab-push"),i=e.querySelector(".ab-setpoint"),s=e.querySelector(".ab-zones"),p=e.querySelector(".ab-error");function l(){let g=D(n.asgardRole)||"slave";o.textContent=g,o.className="role-badge "+(g==="master"?"master":"slave");let d=D(n.asgardPeerStatus)||y("common.na");r.textContent=d,r.classList.toggle("warn",d==="stale"||d==="unreachable");let b=L(n.asgardLastPushC),v=L(n.asgardLastPushAgeS);if(b!=null&&Number.isFinite(b)&&v!=null){let w=v<120?y("diagnostics.asgard.ageSeconds",{value:Math.round(v)}):y("diagnostics.asgard.ageMinutes",{value:Math.round(v/60)});a.textContent=`${b.toFixed(2)}\xB0C (${w})`}else a.textContent="\u2014";let f=L(n.asgardSetpointC);i.textContent=f!=null&&Number.isFinite(f)?`${f.toFixed(1)}\xB0C`:"\u2014";let m=L(n.asgardLocalZones),_=L(n.asgardPeerZones);s.textContent=m!=null?`${m} ${y("common.local")} + ${_||0} ${y("common.peer")}`:"\u2014";let u=D(n.asgardLastError);p.textContent=u||"\u2014",p.classList.toggle("warn",!!u)}[n.asgardRole,n.asgardPeerStatus,n.asgardLastPushC,n.asgardSetpointC,n.asgardLastPushAgeS,n.asgardLocalZones,n.asgardPeerZones,n.asgardLastError].forEach(g=>S(g,l)),C(e),l()}});var nn=.8,sn=`
.preheat-factors-card .pf-list {
  display: grid;
  gap: 9px;
  margin-top: 4px;
}
.preheat-factors-card .pf-row {
  display: grid;
  grid-template-columns: minmax(92px, 1fr) minmax(70px, 1.4fr) 48px;
  gap: 10px;
  align-items: center;
}
.preheat-factors-card .pf-zone {
  min-width: 0;
  color: var(--text-strong);
  font-size: .8rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.preheat-factors-card .pf-track {
  height: 7px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(124,155,208,.14);
  border: 1px solid rgba(120,146,200,.18);
}
.preheat-factors-card .pf-fill {
  display: block;
  width: 0%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--series-cool), var(--accent), var(--series-solar));
  transition: width .25s ease;
}
.preheat-factors-card .pf-value {
  color: var(--accent);
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 800;
  text-align: right;
  white-space: nowrap;
}
`;A("preheat-factors-card",sn);var ln=()=>{let t="";for(let e=1;e<=6;e++)t+=`
      <div class="pf-row" data-zone="${e}">
        <div class="pf-zone"></div>
        <div class="pf-track"><i class="pf-fill"></i></div>
        <div class="pf-value">---</div>
      </div>
    `;return`
    <div class="ui-card preheat-factors-card">
      <div class="ui-card-title"><span data-i18n="diagnostics.preheatFactors.title">Preheat Factors</span></div>
      <div class="pf-list">${t}</div>
      <div class="ui-note" data-i18n="diagnostics.preheatFactors.note">Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat.</div>
    </div>
  `};function cn(t){return Number.isFinite(t)?t.toFixed(2)+"C":"---"}var Hl=T({tag:"preheat-factors-card",render:ln,onMount(t,e){function o(){for(let r=1;r<=6;r++){let a=e.querySelector('[data-zone="'+r+'"]'),i=Number(L(c.preheatAdvance(r))),s=Number.isFinite(i);a.querySelector(".pf-zone").textContent=Y(r),a.querySelector(".pf-value").textContent=cn(i),a.querySelector(".pf-fill").style.width=s?Math.max(0,Math.min(100,i/nn*100))+"%":"0%"}}for(let r=1;r<=6;r++)S(c.preheatAdvance(r),o);q("zoneNames",o),C(e),o()}});var ar=[1,2,3,4,5,6],dn=`
.forecast-preload-status-card .zone-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .82rem;
  margin-top: 4px;
}
.forecast-preload-status-card .zone-table th {
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  text-align: center;
  padding: 4px 2px;
}
.forecast-preload-status-card .zone-table th:first-child { text-align: left; }
.forecast-preload-status-card .zone-table td { padding: 5px 2px; text-align: center; }
.forecast-preload-status-card .zone-table td:first-child {
  text-align: left;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
}
.forecast-preload-status-card .offset-cell {
  font-weight: 700;
  color: var(--text-secondary);
  font-family: var(--mono);
}
.forecast-preload-status-card .offset-cell.active { color: #CBFFD0; }
`;A("forecast-preload-status-card",dn);var pn=t=>`
  <tr data-zone="${t}">
    <td class="zone-name"><span data-i18n="common.zone">Zone</span> ${t}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,un=()=>`
  <div class="ui-card forecast-preload-status-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.forecastPreload.title">Forecast Preload Status</span></div>
    <table class="zone-table">
      <thead>
        <tr><th data-i18n="diagnostics.forecastPreload.zone">Zone</th><th data-i18n="diagnostics.forecastPreload.activeOffset">Active offset</th></tr>
      </thead>
      <tbody class="fc-zone-body">
        ${ar.map(pn).join("")}
      </tbody>
    </table>
    <div class="ui-note" data-i18n="diagnostics.forecastPreload.note">Live forecast preload offset applied to each zone right now. The hours-ahead figure shows when the forecast load peak is expected.</div>
  </div>
`,$l=T({tag:"forecast-preload-status-card",render:un,onMount(t,e){function o(){e.querySelectorAll(".fc-zone-body tr").forEach(r=>{let a=parseInt(r.getAttribute("data-zone"),10);r.querySelector(".zone-name").textContent=Y(a);let i=r.querySelector(".fc-offset"),s=L(c.forecastOffset(a)),p=L(c.forecastPeakH(a));s!=null&&s>.01?(i.textContent=`+${s.toFixed(1)}\xB0`+(p!=null&&p>=0?` (${p}h)`:""),i.classList.add("active")):(i.textContent="\u2014",i.classList.remove("active"))})}ar.forEach(r=>{S(c.forecastOffset(r),o),S(c.forecastPeakH(r),o)}),q("zoneNames",o),C(e),o()}});var nr=[1,2,3,4,5,6],gn=`
.balancing-status-card .zone-table {
  width: 100%;
  border-collapse: collapse;
  font-size: .8rem;
  margin-top: 4px;
}
.balancing-status-card .zone-table th {
  color: var(--text-secondary);
  font-size: .68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .4px;
  text-align: center;
  padding: 4px 2px;
}
.balancing-status-card .zone-table th:first-child { text-align: left; }
.balancing-status-card .zone-table td {
  padding: 4px 2px;
  text-align: center;
  font-family: var(--mono);
  color: var(--text-secondary);
}
.balancing-status-card .zone-table td:first-child {
  text-align: left;
  color: var(--text);
  font-weight: 600;
  white-space: nowrap;
  font-family: inherit;
}
.balancing-status-card .zone-table .eff {
  color: var(--text-strong);
  font-weight: 700;
}
.balancing-status-card .zone-table .err.cold { color: #FFB4B4; }
.balancing-status-card .zone-table .err.warm { color: #CBFFD0; }
`;A("balancing-status-card",gn);var mn=t=>`
  <tr data-zone="${t}">
    <td><span data-i18n="common.zone">Zone</span> ${t}</td>
    <td class="bal-static">\u2014</td>
    <td class="bal-adapt">\u2014</td>
    <td class="bal-eff eff">\u2014</td>
    <td class="bal-err err">\u2014</td>
  </tr>
`,fn=()=>`
  <div class="ui-card balancing-status-card">
    <div class="ui-card-title"><span data-i18n="diagnostics.balancing.title">Balancing Status</span></div>
    <table class="zone-table">
      <thead>
        <tr>
          <th data-i18n="common.zone">Zone</th>
          <th data-i18n="diagnostics.balancing.prior">Prior</th>
          <th data-i18n="diagnostics.balancing.learned">Learned</th>
          <th data-i18n="diagnostics.balancing.effective">Effective</th>
          <th data-i18n="diagnostics.balancing.error">Error</th>
        </tr>
      </thead>
      <tbody class="bal-zone-body">
        ${nr.map(mn).join("")}
      </tbody>
    </table>
    <div class="ui-note" data-i18n="diagnostics.balancing.note">Prior = static design factor. Learned = adaptive multiplier. Effective = prior times learned. Error is the long-window setpoint-room average used to boost cold loops and throttle warm loops.</div>
  </div>
`,Jl=T({tag:"balancing-status-card",render:fn,onMount(t,e){let o=(a,i=2)=>a!=null&&Number.isFinite(Number(a))?Number(a).toFixed(i):"\u2014";function r(){e.querySelectorAll(".bal-zone-body tr").forEach(a=>{let i=parseInt(a.getAttribute("data-zone"),10);a.querySelector(".bal-static").textContent=o(L(c.staticFactor(i))),a.querySelector(".bal-adapt").textContent=o(L(c.balanceAdapt(i))),a.querySelector(".bal-eff").textContent=o(L(c.balanceFactor(i)));let s=L(c.adaptErr(i)),p=a.querySelector(".bal-err");if(p.classList.remove("cold","warm"),s==null||!Number.isFinite(Number(s))){p.textContent="\u2014";return}p.textContent=(s>=0?"+":"")+Number(s).toFixed(2);let l=s>.05?"cold":s<-.05?"warm":"";l&&p.classList.add(l)})}nr.forEach(a=>{S(c.staticFactor(a),r),S(c.balanceAdapt(a),r),S(c.balanceFactor(a),r),S(c.adaptErr(a),r)}),C(e),r()}});var bn=`
/* Probe readouts mirror the zone-detail stat style: small uppercase label
   above a large mono value, no cell chrome. */
.settings-manifold-card .probe-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 20px;
  margin-top: 12px;
}

.settings-manifold-card .probe-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.settings-manifold-card .probe-name {
  color: var(--text-secondary);
  font-size: .64rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.settings-manifold-card .probe-temp {
  font-family: var(--mono);
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-strong);
  line-height: 1;
}
`;A("settings-manifold-card",bn);var hn=()=>{let t="";for(let o=1;o<=8;o++)t+="<option>Probe "+o+"</option>";let e="";for(let o=1;o<=8;o++)e+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${fe("settings.manifold.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${t}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${t}</select></span>
      </div>
      <div class="ui-section" data-i18n="settings.manifold.probeTemps">Probe Temperatures</div>
      <div class="probe-grid">${e}</div>
    </div>
  `},lc=T({tag:"settings-manifold-card",render:hn,onMount(t,e){let o=e.querySelector(".sm-type"),r=e.querySelector(".sm-flow"),a=e.querySelector(".sm-ret"),i=ae(e);i.select(o,{read:()=>D(n.manifoldType)||"NO (Normally Open)",commit:p=>ce("manifold_type",p)}),i.select(r,{read:()=>D(n.manifoldFlowProbe)||"Probe 7",commit:p=>ce("manifold_flow_probe",p)}),i.select(a,{read:()=>D(n.manifoldReturnProbe)||"Probe 8",commit:p=>ce("manifold_return_probe",p)});function s(){for(let p=1;p<=8;p++){let l=e.querySelector('[data-probe="'+p+'"]');l&&(l.textContent=be(L(c.probeTemp(p))))}}S(n.manifoldType,i.refresh),S(n.manifoldFlowProbe,i.refresh),S(n.manifoldReturnProbe,i.refresh);for(let p=1;p<=8;p++)S(c.probeTemp(p),s);C(e),i.refresh(),s()}});var vn=()=>`
  <div class="ui-card settings-minimum-flow-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.minFlow.title">Minimum Zone Flow</span>${fe("settings.minFlow.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.minFlow.enabledSub">manual floor for a modulating heat source, independent of the bridge</span></span>
      <span class="ui-field"><div class="ui-toggle smf-always" role="switch" data-i18n-label="settings.minFlow.title" aria-label="Enable minimum zone flow"></div></span>
    </div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.minFlow.opening">Min valve opening (%)</span> <span class="ui-sublabel" data-i18n="settings.minFlow.openingSub">floor held on every enabled zone while active</span></span>
      <span class="ui-field"><input class="ui-input smf-pct" type="number" min="0" max="50" step="1" placeholder="15" /></span>
    </div>
  </div>
`,bc=T({tag:"settings-minimum-flow-card",render:vn,onMount(t,e){let o=e.querySelector(".smf-always"),r=e.querySelector(".smf-pct"),a=ae(e);a.toggle(o,{read:()=>ee(n.minimumFlowAlways),commit:i=>{let s=i?"on":"off";x(n.minimumFlowAlways,{state:s}),ce("minimum_flow_always",s).catch(()=>x(n.minimumFlowAlways,{state:i?"off":"on"}))}}),a.num(r,{read:()=>L(n.minZoneFlowPct),commit:i=>{x(n.minZoneFlowPct,{value:i}),de("min_zone_flow_pct",i)}}),S(n.minimumFlowAlways,a.refresh),S(n.minZoneFlowPct,a.refresh),C(e),a.refresh()}});var xn=`
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
  border-color: var(--success-border);
  background: var(--success-bg);
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
  background: var(--control-knob);
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-card .ui-toggle.on {
  background: var(--success-bg-soft);
  border-color: var(--success-border);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: var(--text-on-accent);
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
  border-color: var(--control-border-hover);
  color: var(--text-strong);
}

.settings-card .btn.warn {
  grid-column: 1 / -1;
  border-color: var(--danger-border);
  background: var(--danger-bg);
  color: var(--danger-text);
}

.settings-card .btn.warn:hover {
  background: var(--danger-bg-strong);
  border-color: var(--danger-border-strong);
}

@media (max-width: 640px) {
  .settings-card .btn-row {
    grid-template-columns: 1fr;
  }

  .settings-card .btn.warn {
    grid-column: 1;
  }
}
`;A("settings-control-card",xn);var yn=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title" data-i18n="settings.control.title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,zc=T({tag:"settings-control-card",render:yn,onMount(t,e){C(e),e.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ve("reset_1wire_probe_map_reboot")}),e.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ve("dump_1wire_probe_diagnostics")}),e.querySelector(".sc-restart").addEventListener("click",()=>{ve("restart")})}});var wn=`
.settings-motor-cal-card .runtime-note {
  color: var(--state-warn);
  font-size: .74rem;
  line-height: 1.4;
  border: 1px solid rgba(255,133,49,.35);
  background: rgba(255,133,49,.12);
  border-radius: 10px;
  padding: 8px 10px;
  margin: 10px 0 2px;
}

.settings-motor-cal-card .mc-advanced {
  margin-top: 14px;
  border-top: 1px dashed var(--panel-border);
  padding-top: 12px;
}

.settings-motor-cal-card .mc-advanced > summary {
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  cursor: pointer;
  color: var(--text-secondary);
  font-family: var(--font-display);
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.settings-motor-cal-card .mc-advanced > summary::-webkit-details-marker {
  display: none;
}

.settings-motor-cal-card .mc-advanced > summary::after {
  content: '+';
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--accent);
  font-size: 1rem;
  line-height: 1;
}

.settings-motor-cal-card .mc-advanced[open] > summary::after {
  content: '-';
}

.settings-motor-cal-card .mc-advanced-body {
  margin-top: 8px;
}
`;A("settings-motor-calibration-card",wn);var zt=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:n.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:n.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:n.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:n.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:n.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:n.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:n.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:n.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:n.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:n.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:n.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:n.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],zn=()=>{let t="";for(let e=0;e<zt.length;e++){let o=zt[e];if(o.key==="generic_runtime_limit_seconds")continue;let r=Sn(o.key)?"1":"0.1";t+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+y(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${fe("settings.motor.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.drivers">Motor Drivers</span>
        <span class="ui-field"><div class="ui-toggle mc-drivers-toggle" role="switch" data-i18n-label="settings.motor.toggleDrivers" aria-label="Toggle motor drivers"></div></span>
      </div>
      <div class="ui-note" data-i18n="settings.motor.note">Default starting thresholds and learning bounds used by the motor controller.</div>

      <div class="ui-section" data-i18n="settings.motor.profile">Profile</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.motor.motorType">Motor Type (Default Profile)</span>
        <span class="ui-field"><select class="ui-select smc-profile">
          <option value="Generic">Generic</option>
          <option value="HmIP VdMot">HmIP VdMot</option>
        </select></span>
      </div>
      <div class="runtime-note" data-i18n="settings.motor.runtimeNote">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.motor.maxSafeRuntime">Max Safe Runtime</span> (s)</span>
        <span class="ui-field"><input type="number" class="ui-input smc-safe-runtime" value="0" step="1"></span>
      </div>

      <details class="mc-advanced">
        <summary data-i18n="settings.motor.advanced">Advanced motor learning</summary>
        <div class="mc-advanced-body">${t}</div>
      </details>
    </div>
  `};function Sn(t){return t==="learned_factor_min_samples"||t==="generic_runtime_limit_seconds"||t==="relearn_after_movements"||t==="relearn_after_hours"}var Ec=T({tag:"settings-motor-calibration-card",render:zn,onMount(t,e){let o=e.querySelector(".smc-profile"),r=e.querySelector(".smc-safe-runtime"),a=e.querySelector(".mc-drivers-toggle"),i=ae(e);function s(l){if(l==="HmIP VdMot"&&de("hmip_runtime_limit_seconds",40),l==="Generic"){let g=Number(L(n.genericRuntimeLimitSeconds));(!Number.isFinite(g)||g<=0)&&de("generic_runtime_limit_seconds",45)}}i.toggle(a,{read:()=>ee(n.drivers),commit:l=>so(l)}),i.select(o,{read:()=>D(n.motorProfileDefault)||"HmIP VdMot",commit:l=>{ce("motor_profile_default",l),s(l)}});function p(){let l=D(n.motorProfileDefault)||"HmIP VdMot";r.disabled=l==="HmIP VdMot"}i.num(r,{read:()=>(D(n.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:L(n.genericRuntimeLimitSeconds),commit:l=>{o.value==="Generic"&&de("generic_runtime_limit_seconds",l)}});for(let l=0;l<zt.length;l++){let g=zt[l];if(g.key==="generic_runtime_limit_seconds")continue;let d=e.querySelector(".smc-"+g.cls);d&&(i.num(d,{read:()=>L(g.id),commit:b=>de(g.key,b)}),S(g.id,i.refresh))}S(n.drivers,i.refresh),S(n.motorProfileDefault,()=>{i.refresh(),p()}),S(n.genericRuntimeLimitSeconds,i.refresh),S(n.hmipRuntimeLimitSeconds,i.refresh),C(e),s(D(n.motorProfileDefault)||"HmIP VdMot"),i.refresh(),p()}});var _n=`
.settings-asgard-card .ui-row:last-child { margin-bottom: 0; }
`;A("settings-asgard-card",_n);var kn=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.asgard.title">Modulating Heat Source</span>${fe("settings.asgard.help")}</span>
    </div>

    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.asgard.bridgeEnabled">Bridge enabled</span> <span class="ui-sublabel" data-i18n="settings.asgard.bridgeSub">send weighted house temperature to the heat-source controller</span></span>
      <span class="ui-field"><div class="ui-toggle sa-enable" role="switch" data-i18n-label="settings.asgard.bridgeEnabled" aria-label="Toggle heat-source bridge"></div></span>
    </div>

    <div class="gated-body sa-body">
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.coordinator">Coordinator</span> <span class="ui-sublabel" data-i18n="settings.asgard.coordinatorSub">pushes to the heat source</span></span>
        <span class="ui-field"><div class="ui-toggle sa-coord" role="switch" data-i18n-label="settings.asgard.coordinator" aria-label="Toggle coordinator role"></div></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.endpoint">Heat Source Endpoint</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.host">Host</span>
        <span class="ui-field"><input class="ui-input wide sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.port">Port</span>
        <span class="ui-field"><input class="ui-input sa-port" type="number" min="1" max="65535" step="1" placeholder="80" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.asgard.entity">Number entity</span> <span class="ui-sublabel" data-i18n="settings.asgard.entitySub">REST object_id for the weighted house temp</span></span>
        <span class="ui-field"><input class="ui-input wide sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" /></span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.peerBoard">Peer board</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.peerHost">Peer host</span>
        <span class="ui-field"><input class="ui-input wide sa-peer" type="text" placeholder="empty = single board" data-i18n-placeholder="settings.asgard.peerPlaceholder" maxlength="63" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.asgard.pushInterval">Push interval (s)</span>
        <span class="ui-field"><input class="ui-input sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" /></span>
      </div>
    </div>
  </div>
`,Ic=T({tag:"settings-asgard-card",render:kn,onMount(t,e){let o=e.querySelector(".sa-enable"),r=e.querySelector(".sa-coord"),a=e.querySelector(".sa-host"),i=e.querySelector(".sa-port"),s=e.querySelector(".sa-entity"),p=e.querySelector(".sa-peer"),l=e.querySelector(".sa-interval"),g=e.querySelector(".sa-body"),d=ae(e);function b(_,u,w){return k=>{let z=k?"on":"off";x(_,{state:z}),ce(u,z).catch(h=>{console.error(`[Asgard] Failed to update ${w}:`,h),x(_,{state:k?"off":"on"})})}}let v=_=>g.classList.toggle("is-disabled",!_);d.toggle(o,{read:()=>ee(n.asgardEnabled),commit:b(n.asgardEnabled,"asgard_enabled","enabled"),onChange:v}),d.toggle(r,{read:()=>ee(n.asgardCoordinator),commit:b(n.asgardCoordinator,"asgard_coordinator","coordinator")});function f(_,u){return w=>{x(_,{state:w}),lo(u,w).catch(k=>console.error(`[Asgard] Failed to update ${u}:`,k))}}d.text(a,{read:()=>D(n.asgardHost),commit:f(n.asgardHost,"asgard_host")}),d.text(s,{read:()=>D(n.asgardEntityName),commit:f(n.asgardEntityName,"asgard_entity_name")}),d.text(p,{read:()=>D(n.asgardPeerHost),commit:f(n.asgardPeerHost,"asgard_peer_host")});function m(_,u){return w=>{x(_,{value:w}),de(u,w).catch(k=>console.error(`[Asgard] Failed to update ${u}:`,k))}}d.num(i,{read:()=>L(n.asgardPort),commit:m(n.asgardPort,"asgard_port")}),d.num(l,{read:()=>L(n.asgardPushIntervalS),commit:m(n.asgardPushIntervalS,"asgard_push_interval_s")}),S(n.asgardEnabled,d.refresh),S(n.asgardCoordinator,d.refresh),S(n.asgardHost,d.refresh),S(n.asgardEntityName,d.refresh),S(n.asgardPeerHost,d.refresh),S(n.asgardPort,d.refresh),S(n.asgardPushIntervalS,d.refresh),C(e),d.refresh()}});var Ln=`
.settings-forecast-card .fc-badge {
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .9px;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 8px;
  flex-shrink: 0;
  background: var(--status-muted-bg);
  color: var(--status-muted-text);
  border: 1px solid var(--status-muted-border);
}
.settings-forecast-card .fc-badge.ok {
  background: var(--success-bg);
  color: var(--success-text-soft);
  border-color: var(--success-border-soft);
}
.settings-forecast-card .fc-badge.stale,
.settings-forecast-card .fc-badge.external {
  background: rgba(110,90,20,.36);
  color: #FFE9A0;
  border-color: rgba(255,200,50,.35);
}

.settings-forecast-card .fc-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  font-size: .78rem;
}
.settings-forecast-card .fc-age {
  color: var(--text-secondary);
}
.settings-forecast-card .fc-error {
  color: #FFB4B4;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}
.settings-forecast-card .fc-fetch-btn {
  margin-left: auto;
  padding: 4px 12px;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text-strong);
  border-radius: 8px;
  cursor: pointer;
  font-size: .78rem;
  font-weight: 700;
  transition: .18s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.settings-forecast-card .fc-fetch-btn:hover {
  background: var(--control-bg-hover);
  border-color: var(--control-border-hover);
}
.settings-forecast-card .fc-fetch-btn:disabled {
  opacity: .5;
  cursor: default;
}
`;A("settings-forecast-card",Ln);var Cn=()=>`
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.forecast.title">Forecast Preload</span>${fe("settings.forecast.help")}</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="fc-meta">
      <span class="fc-age"></span>
      <span class="fc-error"></span>
      <button class="fc-fetch-btn" data-i18n="settings.forecast.fetchNow">Fetch Now</button>
    </div>

    <div class="ui-row">
      <span class="ui-label" data-i18n="settings.forecast.windEnabled">Wind preload enabled</span>
      <span class="ui-field"><div class="ui-toggle fc-enable" role="switch" data-i18n-label="settings.forecast.toggle" aria-label="Toggle forecast preload"></div></span>
    </div>
    <div class="ui-note" data-i18n="settings.forecast.note">Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.</div>

    <div class="gated-body fc-body">
      <div class="ui-section" data-i18n="settings.forecast.location">Location</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.forecast.latitude">Latitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" data-nostep /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.forecast.longitude">Longitude</span>
        <span class="ui-field"><input class="ui-input wide fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" data-nostep /></span>
      </div>

      <div class="ui-section" data-i18n="settings.forecast.model">Model</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.forecast.loadThreshold">Load threshold</span>
        <span class="ui-field"><input class="ui-input fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.forecast.maxOffset">Max offset (\xB0C)</span>
        <span class="ui-field"><input class="ui-input fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></span>
      </div>
    </div>
  </div>
`,Xc=T({tag:"settings-forecast-card",render:Cn,onMount(t,e){let o=e.querySelector(".fc-badge"),r=e.querySelector(".fc-enable"),a=e.querySelector(".fc-body"),i=e.querySelector(".fc-lat"),s=e.querySelector(".fc-lon"),p=e.querySelector(".fc-threshold"),l=e.querySelector(".fc-maxoffset"),g=e.querySelector(".fc-age"),d=e.querySelector(".fc-error"),b=e.querySelector(".fc-fetch-btn"),v=ae(e);function f(k){if(!k)return"";if(k<16e8)return y("common.clockSyncing");let z=new Date(k*1e3),h=z.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),E=new Date;return z.getFullYear()===E.getFullYear()&&z.getMonth()===E.getMonth()&&z.getDate()===E.getDate()?h:z.toLocaleDateString([],{month:"short",day:"numeric"})+" "+h}function m(){let k=f(L(n.forecastFetchEpoch));g.textContent=k?y("settings.forecast.lastFetch",{time:k}):"";let z=D(n.forecastLastError);d.textContent=z||""}b.addEventListener("click",()=>{b.disabled=!0,b.textContent=y("settings.forecast.fetching"),ve("trigger_forecast_fetch").catch(()=>{}),setTimeout(()=>{Ze()},15e3),setTimeout(()=>{b.disabled=!1,b.textContent=y("settings.forecast.fetchNow")},2e4)});let _=k=>{a&&a.classList.toggle("is-disabled",!k)};v.toggle(r,{read:()=>ee(n.forecastEnabled),onChange:_,commit:k=>{let z=k?"on":"off";x(n.forecastEnabled,{state:z}),ce("forecast_enabled",z).catch(h=>{console.error("[Forecast] toggle failed:",h),x(n.forecastEnabled,{state:k?"off":"on"})})}});function u(k,z){return h=>{x(k,{value:h}),de(z,h).catch(E=>console.error(`[Forecast] ${z} failed:`,E))}}v.num(i,{nostep:!0,read:()=>L(n.forecastLatitude),commit:u(n.forecastLatitude,"forecast_latitude")}),v.num(s,{nostep:!0,read:()=>L(n.forecastLongitude),commit:u(n.forecastLongitude,"forecast_longitude")}),v.num(p,{read:()=>L(n.forecastLoadThreshold),commit:u(n.forecastLoadThreshold,"forecast_load_threshold")}),v.num(l,{read:()=>L(n.forecastMaxOffsetC),commit:u(n.forecastMaxOffsetC,"forecast_max_offset_c")});function w(){let k=D(n.forecastStatus)||"disabled";o.textContent=k,o.className="fc-badge",k==="ok"?o.classList.add("ok"):(k==="stale"||k.indexOf("external")>=0)&&o.classList.add("external")}S(n.forecastStatus,w),S(n.forecastEnabled,()=>{v.refresh(),w()}),S(n.forecastLatitude,v.refresh),S(n.forecastLongitude,v.refresh),S(n.forecastLoadThreshold,v.refresh),S(n.forecastMaxOffsetC,v.refresh),S(n.forecastFetchEpoch,m),S(n.forecastLastError,m),C(e),w(),m(),v.refresh()}});var Fn=`
.settings-balancing-card .bal-reset { width: 100%; }
`;A("settings-balancing-card",Fn);var Mn=()=>`
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.balancing.title">Hydraulic Balancing</span>${fe("settings.balancing.help")}</span></div>

    <div class="ui-row">
      <span class="ui-label" data-i18n="settings.balancing.mode">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option value="Static" data-i18n="settings.balancing.static">Static</option>
        <option value="Adaptive" data-i18n="settings.balancing.adaptive">Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note" data-i18n="settings.balancing.note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top - no return probes - nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="gated-body bal-adaptive-body">
      <div class="ui-section" data-i18n="settings.balancing.tuning">Adaptive tuning</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.interval">Update interval (s)</span>
        <span class="ui-field"><input class="ui-input bal-interval" type="number" min="60" max="86400" step="60" placeholder="3600" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.step">Step (k)</span>
        <span class="ui-field"><input class="ui-input bal-step" type="number" min="0.001" max="0.2" step="0.01" placeholder="0.02" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.minFactor">Min factor</span>
        <span class="ui-field"><input class="ui-input bal-min" type="number" min="0.1" max="1" step="0.05" placeholder="0.5" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.balancing.maxFactor">Max factor</span>
        <span class="ui-field"><input class="ui-input bal-max" type="number" min="1" max="3" step="0.05" placeholder="1.5" /></span>
      </div>
      <button class="ui-btn warn bal-reset" type="button" data-i18n="settings.balancing.reset">Reset balancing</button>
      <div class="ui-note" data-i18n="settings.balancing.resetNote">Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.</div>
    </div>
  </div>
`,ad=T({tag:"settings-balancing-card",render:Mn,onMount(t,e){let o=e.querySelector(".bal-mode"),r=e.querySelector(".bal-adaptive-body"),a=e.querySelector(".bal-interval"),i=e.querySelector(".bal-step"),s=e.querySelector(".bal-min"),p=e.querySelector(".bal-max"),l=ae(e),g=b=>{r&&r.classList.toggle("is-disabled",b!=="Adaptive")};l.select(o,{read:()=>D(n.balanceMode)||"Static",commit:b=>ce("balance_mode",b)}),o.addEventListener("change",()=>g(o.value));function d(b,v){return f=>{x(b,{value:f}),de(v,f).catch(m=>console.error(`[Balancing] ${v} failed:`,m))}}l.num(a,{read:()=>L(n.adaptIntervalS),commit:d(n.adaptIntervalS,"adapt_interval_s")}),l.num(i,{read:()=>L(n.adaptStep),commit:d(n.adaptStep,"adapt_step")}),l.num(s,{read:()=>L(n.adaptMin),commit:d(n.adaptMin,"adapt_min")}),l.num(p,{read:()=>L(n.adaptMax),commit:d(n.adaptMax,"adapt_max")}),e.querySelector(".bal-reset").addEventListener("click",()=>{ho().catch(b=>console.error("[Balancing] reset failed:",b))}),S(n.balanceMode,()=>{l.refresh(),g(D(n.balanceMode)||"Static")}),S(n.adaptIntervalS,l.refresh),S(n.adaptStep,l.refresh),S(n.adaptMin,l.refresh),S(n.adaptMax,l.refresh),C(e),l.refresh(),g(D(n.balanceMode)||"Static")}});var An=`
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
`;A("smart-preheat-card",An);var En=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${fe("settings.preheat.help")}</span></div>
    <div class="ui-row">
      <span class="ui-label"><span data-i18n="settings.preheat.absorption">Preheat Absorption</span> <span class="absorb-badge">idle</span></span>
      <span class="ui-field"><div class="ui-toggle absorb-toggle" role="switch" data-i18n-label="settings.preheat.toggle" aria-label="Toggle preheat absorption"></div></span>
    </div>
    <div class="ui-note" data-i18n="settings.preheat.note">When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.</div>
    <div class="gated-body absorb-body">
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.absorbBand">Absorb band (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.preheat.detectDelta">Detect delta (\xB0C)</span>
        <span class="ui-field"><input class="ui-input absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" /></span>
      </div>
    </div>
  </div>
`,gd=T({tag:"smart-preheat-card",render:En,onMount(t,e){let o=e.querySelector(".absorb-toggle"),r=e.querySelector(".absorb-badge"),a=e.querySelector(".absorb-band"),i=e.querySelector(".absorb-delta"),s=e.querySelector(".absorb-body"),p=ae(e),l=d=>{s&&s.classList.toggle("is-disabled",!d)};p.toggle(o,{read:()=>ee(n.preheatAbsorbEnabled),onChange:l,commit:d=>{let b=d?"on":"off";x(n.preheatAbsorbEnabled,{state:b}),ce("preheat_absorb_enabled",b)}}),p.num(a,{read:()=>L(n.preheatAbsorbBandC),commit:d=>{x(n.preheatAbsorbBandC,{value:d}),de("preheat_absorb_band_c",d)}}),p.num(i,{read:()=>L(n.preheatDetectDeltaC),commit:d=>{x(n.preheatDetectDeltaC,{value:d}),de("preheat_detect_delta_c",d)}});function g(){let d=String(D(n.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=d?y("common.active"):y("common.idle"),r.classList.toggle("active",d)}S(n.preheatAbsorbEnabled,p.refresh),S(n.preheatAbsorbing,g),S(n.preheatAbsorbBandC,p.refresh),S(n.preheatDetectDeltaC,p.refresh),C(e),p.refresh(),g()}});var Nn=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800&family=Source+Sans+3:wght@400;500;600;700&display=swap");

:root {
  /* ===========================================================
     Palette (thermal utility):
       #00131d #002f45 #2c4875 #7aa7ce #9dbc78
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones \u2192 surfaces/borders; orange \u2192 primary accent,
     muted steel blue \u2192 secondary/cool return/weather data; warm members
     \u2192 data series + states. Greens for "OK" status are kept for status
     legibility.
     =========================================================== */
  --accent: #ff8531;          /* orange \u2014 primary accent */
  --blue: #7aa7ce;            /* muted cool blue \u2014 secondary / return / wind accent */
  /* Chart data series \u2014 orange (warm) + muted blue (cool). */
  --series-warm: #ff8531;
  --series-cool: #7aa7ce;
  --series-cool-fill: rgba(122,167,206,.14);
  --series-solar: #ffc14d;    /* gold \u2014 solar irradiance / current-hour highlight */
  /* Axis/tick label color \u2014 warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(233,222,210,.82);
  --bg: #00131d;
  --surface: #002f45;
  --card: #021d2b;
  --border: rgba(120,146,200,.22);
  --text: #FFFFFF;
  --text-strong: #FFF4E6;
  --text-secondary: rgba(255,239,224,.84);
  --muted: rgba(247,233,221,.74);
  --text-faint: rgba(229,216,222,.56);
  --text-on-accent: #00202e;
  --overlay-bg: rgba(0,19,29,.96);
  --overlay-bg-soft: rgba(0,19,29,.72);
  --soft: rgba(124,155,208,.12);
  --panel-border: rgba(120,146,200,.28);
  --panel-border-soft: rgba(120,146,200,.18);
  --divider: rgba(255,255,255,.07);
  --divider-dashed: rgba(120,146,200,.28);
  --panel-bg: rgba(0,47,69,.34);
  --panel-bg-vibrant: var(--panel-bg);
  --panel-bg-flat: var(--panel-bg);
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.025), 0 12px 30px rgba(0,0,0,.32);
  --panel-shadow-soft: var(--panel-shadow);
  --state-ok: #79d17e;
  --state-warn: #ffa600;
  --state-danger: #ff6361;
  --state-disabled: #6E7E96;
  --control-bg: rgba(124,155,208,.10);
  --control-bg-hover: rgba(124,155,208,.16);
  --control-border: rgba(120,146,200,.30);
  --control-border-strong: rgba(120,146,200,.45);
  --control-border-hover: rgba(120,146,200,.52);
  --control-knob: #efe6dd;
  --focus-ring: rgba(124,155,208,.72);
  --focus-ring-soft: rgba(124,155,208,.60);
  --focus-border: rgba(124,155,208,.55);
  --accent-bg-soft: rgba(255,133,49,.12);
  --accent-border: rgba(255,133,49,.35);
  --accent-border-hover: rgba(255,133,49,.50);
  --accent-text-soft: #ffe8ba;
  --success-bg: rgba(45,110,45,.28);
  --success-bg-soft: rgba(121,209,126,.25);
  --success-border: rgba(121,209,126,.50);
  --success-border-soft: rgba(121,209,126,.25);
  --success-text-soft: #CBFFD0;
  --warn-bg-soft: rgba(255,166,0,.12);
  --warn-border: rgba(255,166,0,.42);
  --danger-bg: rgba(255,118,118,.20);
  --danger-bg-strong: rgba(255,100,100,.30);
  --danger-bg-soft: rgba(255,100,100,.15);
  --danger-border: rgba(255,118,118,.50);
  --danger-border-soft: rgba(255,118,118,.40);
  --danger-border-strong: rgba(255,100,100,.60);
  --danger-text: #FFD9D9;
  --status-muted-bg: rgba(70,70,70,.28);
  --status-muted-border: rgba(150,150,150,.25);
  --status-muted-text: #ADADAD;
  --viz-flow-low: #7aa7ce;
  --viz-flow-mid: #9dbc78;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #7aa7ce;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #79d17e;
  --red: #ff6361;
  --font-ui: "Source Sans 3", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-display: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 13px; scroll-behavior: smooth; }
body {
  font-family: var(--font-ui);
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(255,133,49,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(122,167,206,.10), transparent 64%),
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
  grid-template-columns: 1fr;
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > * {
  flex: 1;
}

.zone-layout,
.logs-layout {
  display: grid;
  gap: 14px;
}

/* Logs: main log stream (2/3) + stacked diagnostics column (1/3). */
.logs-layout {
  grid-template-columns: 2fr 1fr;
  align-items: start;
}

.logs-main-col,
.logs-side-col {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
/* Slots grow to share the column's full height so the stack matches the Zone
   and Zone Settings columns (no gap left below the last card). */
.zone-mid-col > * { width: 100%; flex: 1 1 auto; }

.zone-layout .ui-card,
.zone-layout .zone-detail,
.zone-layout .diag-zone-recovery {
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
}

.settings-layout,
.diagnostics-layout {
  display: grid;
  gap: 18px;
}

.settings-layout {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
}

.settings-side-stack {
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 18px;
  min-width: 0;
  height: 100%;
}

.settings-group,
.diagnostics-group {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 12px;
  padding: 18px 20px;
  border: 1px solid var(--panel-border);
  border-radius: 14px;
  background: var(--panel-bg-flat);
  box-shadow: var(--panel-shadow-soft);
}

.diagnostics-group {
  padding-top: 14px;
}

.settings-group-head,
.diagnostics-group-head {
  display: flex;
  align-items: center;
  min-height: 30px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.settings-group-title,
.diagnostics-group-title {
  font-family: var(--font-display);
  color: var(--accent);
  font-size: .86rem;
  font-weight: 800;
  letter-spacing: 1.05px;
  text-transform: uppercase;
}

.settings-group-grid,
.diagnostics-group-grid {
  display: grid;
  gap: 12px;
  align-items: start;
  align-content: start;
}

.settings-installation-grid {
  grid-template-columns: 1fr;
}

.settings-heat-source-grid {
  grid-template-columns: 1fr;
}

.settings-weather-grid,
.settings-motor-grid {
  grid-template-columns: 1fr;
}

.settings-heat-source-stack,
.manual-control-col {
  display: grid;
  gap: 12px;
}

.settings-group .ui-card,
.settings-group .settings-card {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.settings-group-grid > * + *,
.settings-group .ui-card + .ui-card,
.settings-group .settings-card + .settings-card,
.settings-heat-source-stack > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.settings-group .ui-card-title,
.settings-group .settings-card .card-title {
  color: var(--muted);
  font-size: .68rem;
  letter-spacing: .82px;
  margin-bottom: 2px;
  padding-bottom: 4px;
  border-bottom: 0;
}

.diagnostics-layout {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: start;
}

.diagnostics-logs-group,
.diagnostics-health-group,
.diagnostics-learning-group {
  grid-column: span 2;
}

.logs-main-col,
.manual-control-col,
.diag-learning-grid {
  min-width: 0;
}

.diag-learning-grid,
.diag-health-grid,
.diag-actions-grid {
  grid-template-columns: 1fr;
}

.diagnostics-group .ui-card,
.diagnostics-group .settings-card,
.diagnostics-group .logs-view,
.diagnostics-group .diag-zone-motor,
.diagnostics-group .connectivity-card,
.diagnostics-group .diag-i2c {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

.diagnostics-group-grid > * + *,
.manual-control-col > * + *,
.logs-main-col > * + * {
  padding-top: 12px;
  border-top: 1px dashed var(--divider-dashed);
}

.diagnostics-group .ui-card-title,
.diagnostics-group .settings-card .card-title,
.diagnostics-group .logs-view .card-title,
.diagnostics-group .diag-zone-motor .card-title,
.diagnostics-group .connectivity-card .card-title,
.diagnostics-group .diag-i2c .card-title {
  color: var(--text-secondary);
  font-size: .72rem;
  letter-spacing: 1px;
  margin-bottom: 4px;
  padding-bottom: 8px;
  border-bottom-color: var(--panel-border-soft);
}

.ftr {
  text-align: center;
  color: var(--text-faint);
  padding: 20px;
  font-size: .72rem;
  letter-spacing: .8px;
}

.placeholder-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
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

@media (max-width: 1200px) {
  .diagnostics-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout,
  .diagnostics-layout { grid-template-columns: 1fr; }

  .settings-side-stack {
    grid-template-rows: none;
    gap: 18px;
    height: auto;
  }

  .diagnostics-logs-group,
  .diagnostics-health-group,
  .diagnostics-learning-group {
    grid-column: auto;
  }

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
  outline: 2px solid var(--focus-ring);
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
`;A("app-root",Nn);var Tn=t=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-forecast" style="margin-top:14px"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
          <div class="overview-flow-return"></div>
        </div>
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
          <div class="settings-group settings-installation-group">
            <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.installation">Installation</span></div>
            <div class="settings-group-grid settings-installation-grid">
              <div class="settings-manifold-slot"></div>
              <div class="settings-balancing-slot"></div>
            </div>
          </div>
          <div class="settings-group settings-heat-source-group">
            <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.heatSource">Heat Source</span></div>
            <div class="settings-group-grid settings-heat-source-grid">
              <div class="settings-asgard-slot"></div>
              <div class="settings-heat-source-stack">
                <div class="settings-min-flow-slot"></div>
                <div class="settings-preheat-slot"></div>
              </div>
            </div>
          </div>
          <div class="settings-side-stack">
            <div class="settings-group settings-weather-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.weather">Weather Preload</span></div>
              <div class="settings-group-grid settings-weather-grid">
                <div class="settings-forecast-slot"></div>
              </div>
            </div>
            <div class="settings-group settings-motor-group">
              <div class="settings-group-head"><span class="settings-group-title" data-i18n="settings.group.motorAdvanced">Motor Advanced</span></div>
              <div class="settings-group-grid settings-motor-grid">
                <div class="settings-motor-cal-slot"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="diagnostics-layout">
          <div class="diagnostics-group diagnostics-logs-group">
            <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.logs">Logs</span></div>
            <div class="logs-main-col"></div>
          </div>
          <div class="diagnostics-group diagnostics-manual-group">
            <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.manual">Manual Motor Control</span></div>
            <div class="manual-control-col"></div>
          </div>
          <div class="diagnostics-group diagnostics-actions-group">
            <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.actions">Service Actions</span></div>
            <div class="diagnostics-group-grid diag-actions-grid"></div>
          </div>
          <div class="diagnostics-group diagnostics-health-group">
            <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.health">Device Health</span></div>
            <div class="diagnostics-group-grid diag-health-grid"></div>
          </div>
          <div class="diagnostics-group diagnostics-learning-group">
            <div class="diagnostics-group-head"><span class="diagnostics-group-title" data-i18n="diagnostics.group.learning">Learning &amp; Balance</span></div>
            <div class="diagnostics-group-grid diag-learning-grid"></div>
          </div>
        </div>
      </section>
      <div class="ftr" data-i18n="footer.product">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;T({tag:"app-root",render:Tn,onMount(t,e){e.querySelector(".hdr").appendChild(j("hv6-header")),e.querySelector(".overview-flow").appendChild(j("flow-diagram")),e.querySelector(".overview-forecast").appendChild(j("monitor-forecast-preview")),e.querySelector(".overview-timeline").appendChild(j("zone-state-timeline")),e.querySelector(".overview-flow-return").appendChild(j("graph-widgets",{variant:"flow-return"})),e.querySelector(".zone-selector").appendChild(j("zone-grid")),e.querySelector(".zone-detail-slot").appendChild(j("zone-detail",{zone:B("selectedZone")})),e.querySelector(".zone-sensor-slot").appendChild(j("zone-sensor-card")),e.querySelector(".zone-recovery-slot").appendChild(j("diag-zone-recovery-card")),e.querySelector(".zone-room-slot").appendChild(j("zone-room-card")),e.querySelector(".settings-manifold-slot").appendChild(j("settings-manifold-card")),e.querySelector(".settings-balancing-slot").appendChild(j("settings-balancing-card")),e.querySelector(".settings-asgard-slot").appendChild(j("settings-asgard-card")),e.querySelector(".settings-min-flow-slot").appendChild(j("settings-minimum-flow-card")),e.querySelector(".settings-preheat-slot").appendChild(j("smart-preheat-card")),e.querySelector(".settings-forecast-slot").appendChild(j("settings-forecast-card")),e.querySelector(".settings-motor-cal-slot").appendChild(j("settings-motor-calibration-card")),e.querySelector(".logs-main-col").appendChild(j("logs-view"));let r=e.querySelector(".manual-control-col");r.appendChild(j("diag-manual-badge")),r.appendChild(j("diag-zone-motor-card",{zone:B("selectedZone")||1}));let a=e.querySelector(".diag-health-grid");a.appendChild(j("connectivity-card")),a.appendChild(j("asgard-bridge-status-card")),a.appendChild(j("diag-system-card")),a.appendChild(j("diag-i2c"));let i=e.querySelector(".diag-learning-grid");i.appendChild(j("preheat-factors-card")),i.appendChild(j("forecast-preload-status-card")),i.appendChild(j("balancing-status-card")),e.querySelector(".diag-actions-grid").appendChild(j("settings-control-card"));let p=e.querySelectorAll(".sec");function l(){let g=B("section");p.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===g)})}q("section",l),C(e),l()}});function Dn(){let t=document.getElementById("app");if(!t)throw new Error("Dashboard root #app not found");t.innerHTML="",t.appendChild(j("app-root")),Nt()}Dn();})();

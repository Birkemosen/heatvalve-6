(()=>{var Gt={},Xe={};function P(e){return Gt[e.tag]=e,e}function V(e,t){let o=Gt[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let s=o.state(t||{});for(let m in s)r[m]=s[m]}if(o.methods)for(let s in o.methods)r[s]=o.methods[s];let n=document.createElement("div");n.innerHTML=o.render(r);let c=n.firstElementChild;return o.onMount&&o.onMount(r,c),c}function z(e,t){(Xe[e]||(Xe[e]=[])).push(t)}function ne(e){let t=Xe[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var se=6,ir=28,Ye=Object.create(null),lr=pr(),W={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:dr(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:lr,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},cr=300;function dr(){let e=Object.create(null);for(let t=1;t<=se;t++)e[t]=[];return e}function pr(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<se;)e.push("");return e.slice(0,se)}function ur(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(W.zoneNames))}catch(e){}}function ie(e){return"$dashboard:"+e}function kt(e){return Math.max(1,Math.min(se,Number(e)||1))}function Ut(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function k(e){let t=Ye[e];return t?t.v!=null?t.v:t.value!=null?t.value:Ut(t.s!=null?t.s:t.state):null}function D(e){let t=Ye[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function mr(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function K(e){return mr(D(e))}function x(e,t){let o=Ye[e];o||(o=Ye[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);if(ne(e),e==="text_sensor-firmware_version"&&Te("firmwareVersion",D(e)||""),e.startsWith("text-zone_")&&e.endsWith("_name")){let r=parseInt(e.slice(10,-5),10);if(r>=1&&r<=se){let n=D(e)||"";W.zoneNames[r-1]!==n&&(W.zoneNames[r-1]=n,ur(),ne(ie("zoneNames")))}}}function I(e,t){z(ie(e),t)}function Z(e){return W[e]}function Te(e,t){W[e]=t,ne(ie(e))}function Xt(e){let t=e==="logs"?"diagnostics":e;W.section!==t&&(W.section=t,ne(ie("section")))}function Yt(e){let t=kt(e);W.selectedZone!==t&&(W.selectedZone=t,ne(ie("selectedZone")))}function De(e){let t=!!e;W.live!==t&&(W.live=t,ne(ie("live")))}function Kt(){W.pendingWrites+=1,ne(ie("pendingWrites"))}function Lt(){W.pendingWrites=Math.max(0,W.pendingWrites-1),W.lastWriteAt=Date.now(),ne(ie("pendingWrites"))}function Jt(){return W.pendingWrites>0?!0:Date.now()-W.lastWriteAt<2e3}function _e(e){return W.zoneNames[kt(e)-1]||""}function J(e){let t=kt(e),o=_e(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function Pe(e){W.i2cResult=e||"No scan has been run yet.",ne(ie("i2cResult"))}function O(e,t){let o={time:gr(),msg:String(e||"")};for(W.activityLog.push(o);W.activityLog.length>60;)W.activityLog.shift();if(t>=1&&t<=se){let r=W.zoneLog[t];for(r.push(o);r.length>8;)r.shift();ne(ie("zoneLog:"+t))}ne(ie("activityLog"))}function Qt(e){return e>=1&&e<=se?W.zoneLog[e]:W.activityLog}function _t(e,t){let o=W[e];if(!Array.isArray(o))return;let r=Ut(t);if(r!=null){for(o.push(r);o.length>ir;)o.shift();ne(ie(e))}}function Be(e){let t=Date.now();if(!e&&t-W.lastHistoryAt<3200)return;W.lastHistoryAt=t;let o=0,r=0;for(let n=1;n<=se;n++){let c=k("sensor-zone_"+n+"_valve_pct");c!=null&&(o+=c,r+=1)}_t("historyFlow",k("sensor-manifold_flow_temperature")),_t("historyReturn",k("sensor-manifold_return_temperature")),_t("historyDemand",r?o/r:0)}function gr(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Ke(e){W.zoneStateHistory=e||null,ne(ie("zoneStateHistory"))}function eo(){return W.deviceLogSeq}function Je(e,t){if(Array.isArray(e)&&e.length){for(let o of e)W.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>W.deviceLogSeq&&(W.deviceLogSeq=o[0]);for(;W.deviceLog.length>cr;)W.deviceLog.shift();ne(ie("deviceLog"))}typeof t=="number"&&t>W.deviceLogSeq&&(W.deviceLogSeq=t-1)}function to(){return W.deviceLog}function oo(){W.deviceLog=[],ne(ie("deviceLog"))}function Qe(e){W.forecastHours=e||null,ne(ie("forecastHours"))}function et(){return W.forecastHours}var i={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",name:e=>"text-zone_"+e+"_name",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h",staticFactor:e=>"sensor-zone_"+e+"_static_factor",balanceFactor:e=>"sensor-zone_"+e+"_balance_factor",balanceAdapt:e=>"sensor-zone_"+e+"_balance_adapt",adaptErr:e=>"sensor-zone_"+e+"_adapt_err"},a={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minimumFlowAlways:"switch-minimum_flow_always",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFetchEpoch:"sensor-forecast_fetch_epoch",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c",balanceMode:"select-balance_mode",adaptIntervalS:"number-adapt_interval_s",adaptStep:"number-adapt_step",adaptMin:"number-adapt_min",adaptMax:"number-adapt_max",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var re=6,fr=8,ro=null,Oe=0,tt=1,ao=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],B={temp:new Float32Array(re),setpoint:new Float32Array(re),valve:new Float32Array(re),enabled:new Uint8Array(re),driversEnabled:1,fault:0,manualMode:0};function br(){B.manualMode=0,Te("manualMode",!1);for(let l=0;l<re;l++){B.temp[l]=20.5+l*.4,B.setpoint[l]=21+l%3*.5,B.valve[l]=12+l*8,B.enabled[l]=l===4?0:1;let p=l+1;x(i.temp(p),{value:B.temp[l]}),x(i.setpoint(p),{value:B.setpoint[l]}),x(i.valve(p),{value:B.valve[l]}),x(i.state(p),{state:B.valve[l]>5?"heating":"idle"}),x(i.enabled(p),{value:!!B.enabled[l],state:B.enabled[l]?"on":"off"}),x(i.probe(p),{state:"Probe "+p}),x(i.tempSource(p),{state:p%2?"Local Probe":"BLE"}),x(i.syncTo(p),{state:"None"}),x(i.pipeType(p),{state:"PEX 16mm"}),x(i.area(p),{value:8+p*3.5}),x(i.spacing(p),{value:[150,200,150,100,200,150][l]}),x(i.ble(p),{state:"AA:BB:CC:DD:EE:0"+p}),x(i.name(p),{state:["Living Room","Kitchen","Bedroom","Bathroom","Office","Hallway"][l]||""}),x(i.exteriorWalls(p),{state:["N","E","S","W","N,E","S,W"][l]}),x(i.windExposure(p),{value:[.5,.5,.5,.5,.7,.7][l]}),x(i.solarGain(p),{value:.3}),x(i.thermalLeadH(p),{value:4}),x(i.preheatAdvance(p),{value:.08+l*.03});let u=[.62,.78,1,.55,.88,.7][l],w=[1.08,.95,1,1.15,.9,1.02][l];x(i.staticFactor(p),{value:u}),x(i.balanceAdapt(p),{value:w}),x(i.balanceFactor(p),{value:Math.min(1,u*w)}),x(i.adaptErr(p),{value:[.12,-.05,0,.22,-.1,.03][l]})}for(let l=1;l<=fr;l++){let p=l<=re?l:re,u=B.temp[p-1]+(l>re?1:.1*l);x(i.probeTemp(l),{value:u})}x(a.flow,{value:34.1}),x(a.ret,{value:30.4}),x(a.uptime,{value:18*3600+720}),x(a.wifi,{value:-57}),x(a.drivers,{value:!0,state:"on"}),x(a.fault,{value:!1,state:"off"}),x(a.ip,{state:"192.168.1.86"}),x(a.ssid,{state:"MockLab"}),x(a.mac,{state:"D8:3B:DA:12:34:56"}),x(a.firmware,{state:"0.5.x-mock"}),x(a.manifoldFlowProbe,{state:"Probe 7"}),x(a.manifoldReturnProbe,{state:"Probe 8"}),x(a.manifoldType,{state:"NC (Normally Closed)"}),x(a.motorProfileDefault,{state:"HmIP VdMot"}),x(a.closeThresholdMultiplier,{value:1.7}),x(a.closeSlopeThreshold,{value:1}),x(a.closeSlopeCurrentFactor,{value:1.4}),x(a.openThresholdMultiplier,{value:1.7}),x(a.openSlopeThreshold,{value:.8}),x(a.openSlopeCurrentFactor,{value:1.3}),x(a.openRippleLimitFactor,{value:1}),x(a.genericRuntimeLimitSeconds,{value:45}),x(a.hmipRuntimeLimitSeconds,{value:40}),x(a.relearnAfterMovements,{value:2e3}),x(a.relearnAfterHours,{value:168}),x(a.learnedFactorMinSamples,{value:3}),x(a.learnedFactorMaxDeviationPct,{value:12}),x(a.simplePreheatEnabled,{state:"on"}),x(a.balanceMode,{state:"Adaptive"}),x(a.adaptIntervalS,{value:3600}),x(a.adaptStep,{value:.02}),x(a.adaptMin,{value:.5}),x(a.adaptMax,{value:1.5}),x(a.minZoneFlowPct,{value:15}),x(a.minimumFlowAlways,{state:"off"}),x(a.cpuLoadCore0,{value:18.5}),x(a.cpuLoadCore1,{value:7.2}),x(a.freeInternalKb,{value:142}),x(a.freePsramKb,{value:7800}),Be(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],n=[];for(let l=0;l<o;l++){let p=(o-1-l)*e,u=t-p,w=Math.floor(l/12)%24,y=r.map(h=>h[w%h.length]),f=p/3600,g=f>2.5&&f<3.5||f>8.5&&f<9.5?1:0,_=y.filter(h=>h===5).length,d=Math.round(Math.min(100,_*15+Math.abs(Math.sin(l/8))*6)),S=Number((30+_*1.4+Math.sin(l/11)*1.5).toFixed(1)),L=Number((S-(1.4+_*.35)).toFixed(1));n.push([u,...y,g,S,L,d])}Ke({interval_s:e,uptime_s:t,count:o,entries:n});let c=[];for(let l=0;l<48;l++){let p=6-3*Math.sin(l/24*Math.PI)-(l>10&&l<20?2:0),u=4+(l>8&&l<18?9*Math.exp(-Math.pow(l-13,2)/12):0)+Math.sin(l/5),w=(220+l*4)%360,y=l%24,f=Math.max(0,Math.round(820*Math.sin((y-6)/12*Math.PI)));c.push([Number(p.toFixed(1)),Number(Math.max(0,u).toFixed(1)),Math.round(w),f])}let s=new Date(t*1e3);s.setHours(0,0,0,0);let m=Math.floor(s.getTime()/1e3);Qe({base_epoch:m,age_s:480,fetch_epoch:t-480,count:48,hours:c}),no(6)}function no(e){let t=[];for(let o=0;o<e;o++){let r=ao[tt%ao.length];t.push([tt,r[0],r[1],r[2]]),tt++}Je(t,tt)}function hr(){Oe+=1,x(a.uptime,{value:Number(Date.now()/1e3)|0}),x(a.wifi,{value:-55-Math.round((1+Math.sin(Oe/4))*6)});let e=0,t=0,o=0;for(let s=0;s<re;s++){let m=s+1,l=!!B.enabled[s],p=B.temp[s],u=B.setpoint[s],w=l&&B.driversEnabled&&!B.manualMode&&p<u-.25;B.manualMode?B.valve[s]=Math.max(0,B.valve[s]):!l||!B.driversEnabled?B.valve[s]=Math.max(0,B.valve[s]-6):w?B.valve[s]=Math.min(100,B.valve[s]+7+m%3):B.valve[s]=Math.max(0,B.valve[s]-5);let y=w?.05+B.valve[s]/2200:-.03+B.valve[s]/3200;B.temp[s]=p+y+Math.sin((Oe+m)/5)*.04,l&&B.valve[s]>0&&(e+=B.valve[s],t+=1,o=Math.max(o,B.valve[s])),x(i.temp(m),{value:B.temp[s]}),x(i.valve(m),{value:Math.round(B.valve[s])});let f=Math.max(0,(B.setpoint[s]-B.temp[s]-.15)*.22);x(i.preheatAdvance(m),{value:Number(f.toFixed(2))}),x(i.state(m),{state:l?w?"heating":"idle":"off"}),x(i.enabled(m),{value:l,state:l?"on":"off"}),x(i.probeTemp(m),{value:B.temp[s]+Math.sin((Oe+m)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(Oe/6)*.25,n=r-(t?2.1+e/Math.max(1,t*50):1.1);x(a.flow,{value:Number(r.toFixed(1))}),x(a.ret,{value:Number(n.toFixed(1))}),x(i.probeTemp(7),{value:Number((n-.4).toFixed(1))}),x(i.probeTemp(8),{value:Number((r+.2).toFixed(1))}),Be(!0);let c=Z("zoneStateHistory");c&&(c.uptime_s=Number(Date.now()/1e3)|0),Oe%3===0&&no(1)}function so(){ro||(br(),De(!0),ro=setInterval(hr,1200))}function ot(e){var c;let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=re){let s=Number(o);Number.isNaN(s)||(B.setpoint[r-1]=s,x(i.setpoint(r),{value:s}),O("Zone "+r+" setpoint set to "+s.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=re){let s=o>.5;B.enabled[r-1]=s?1:0,x(i.enabled(r),{value:s,state:s?"on":"off"}),O("Zone "+r+(s?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let s=o>.5;B.driversEnabled=s?1:0,x(a.drivers,{value:s,state:s?"on":"off"}),O(s?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let s=o>.5;B.manualMode=s?1:0,Te("manualMode",s);return}if(t==="motor_target"&&r>=1&&r<=re){let s=Number(o||0);x(i.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(s)))}),O("Motor "+r+" target set to "+s+"%",r);return}if(t==="command"){let s=String(o);if(s==="i2c_scan"){Pe(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),O("I2C scan complete");return}if(s==="calibrate_all_motors"||s==="restart"){O("Command executed: "+s);return}if(s==="open_motor_timed"&&r>=1&&r<=re){O("Motor "+r+" open timed",r);return}if(s==="close_motor_timed"&&r>=1&&r<=re){O("Motor "+r+" close timed",r);return}if(s==="stop_motor"&&r>=1&&r<=re){O("Motor "+r+" stopped",r);return}if(s==="motor_reset_fault"&&r>=1&&r<=re){O("Motor "+r+" fault reset",r);return}if(s==="motor_reset_learned_factors"&&r>=1&&r<=re){O("Motor "+r+" learned factors reset",r);return}if(s==="motor_reset_and_relearn"&&r>=1&&r<=re){O("Motor "+r+" reset and relearn started",r);return}if(s==="dump_task_stats"){O("Task stats dumped to device log (mock)");return}if(s==="reset_balancing"){for(let m=1;m<=re;m++)x(i.balanceAdapt(m),{value:1}),x(i.balanceFactor(m),{value:(c=k(i.staticFactor(m)))!=null?c:1}),x(i.adaptErr(m),{value:null});O("Adaptive balancing reset");return}return}if(t==="zone_probe"&&r>=1){x(i.probe(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){x(i.tempSource(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){x(i.syncTo(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){x(i.pipeType(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){x(a.manifoldType,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){x(a.manifoldFlowProbe,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){x(a.manifoldReturnProbe,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){x(a.motorProfileDefault,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){x(a.simplePreheatEnabled,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="minimum_flow_always"){x(a.minimumFlowAlways,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="balance_mode"){x(a.balanceMode,{state:String(o)}),O("Setting updated: "+t+" = "+o);return}if(t==="zone_name"&&r>=1){x(i.name(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_ble_mac"&&r>=1){x(i.ble(r),{state:String(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){let s=String(o)||"None";x(i.exteriorWalls(r),{state:s});let m=s==="None"?0:s.split(",").filter(Boolean).length,l=[0,.5,.7,.85,1][Math.min(m,4)];x(i.windExposure(r),{value:l}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){x(i.area(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){x(i.spacing(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_wind_exposure"&&r>=1){x(i.windExposure(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_solar_gain"&&r>=1){x(i.solarGain(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}if(t==="zone_thermal_lead_h"&&r>=1){x(i.thermalLeadH(r),{value:Number(o)}),O("Setting updated: "+t+" = "+o,r);return}let n={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax,min_zone_flow_pct:a.minZoneFlowPct};if(n[t]){let s=Number(o);Number.isNaN(s)||(x(n[t],{value:s}),O("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){ot({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!B.enabled[e-1];ot({key:"zone_enabled",value:t?1:0,zone:e})}};var rt="/api/hv6/v1";function at(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function ue(e,t,o){if(Kt(),at())try{return ot(o),Promise.resolve({ok:!0})}finally{Lt()}let r=new URLSearchParams;for(let[s,m]of Object.entries(t||{}))m!=null&&r.append(s,m);let n=r.toString(),c=rt+e+(n?"?"+n:"");return fetch(c,{method:"POST"}).then(s=>(s.ok||console.warn(`API call failed: POST ${e} status=${s.status}`),s)).catch(s=>{throw console.error(`API call error: POST ${e}:`,s),s}).finally(()=>{Lt()})}function Ct(e,t){return x(i.setpoint(e),{value:t}),ue(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function io(e,t){return x(i.enabled(e),{state:t?"on":"off",value:t}),ue(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function nt(e){return x(a.drivers,{state:e?"on":"off",value:e}),ue("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function he(e,t){return ue("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function lo(){return Pe("Scanning I2C bus..."),O("I2C scan started"),he("i2c_scan")}var vr={zone_probe:e=>i.probe(e),zone_temp_source:e=>i.tempSource(e),zone_sync_to:e=>i.syncTo(e),zone_pipe_type:e=>i.pipeType(e)},xr={zone_ble_mac:e=>i.ble(e),zone_exterior_walls:e=>i.exteriorWalls(e),zone_name:e=>i.name(e)},yr={zone_area_m2:e=>i.area(e),zone_pipe_spacing_mm:e=>i.spacing(e)},wr={manifold_type:a.manifoldType,manifold_flow_probe:a.manifoldFlowProbe,manifold_return_probe:a.manifoldReturnProbe,motor_profile_default:a.motorProfileDefault,simple_preheat_enabled:a.simplePreheatEnabled,balance_mode:a.balanceMode},zr={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax};function Re(e,t,o){let r=vr[t];return r&&x(r(e),{state:o}),ue("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function We(e,t,o){let r=xr[t];return r&&x(r(e),{state:o}),ue("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function He(e,t,o){let r=Number(o),n=yr[t];return n&&!Number.isNaN(r)&&x(n(e),{value:r}),ue("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function me(e,t){let o=wr[e];return o&&x(o,{state:t}),ue("/settings/select",{key:e,value:t},{key:e,value:t})}function le(e,t){let o=Number(t),r=zr[e];return r&&!Number.isNaN(o)&&x(r,{value:o}),ue("/settings/number",{key:e,value:o},{key:e,value:o})}function co(e,t){return ue("/settings/text",{key:e,value:t},{key:e,value:t})}function po(e,t){let o=String(t||"").trim();return O("Zone "+e+" renamed to "+(o||"(blank)"),e),We(e,"zone_name",o)}function uo(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return x(i.motorTarget(e),{value:r}),O("Motor "+e+" target set to "+r+"%",e),ue(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function mo(e,t=1e4){return O("Motor "+e+" open for "+t+"ms",e),ue(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function go(e,t=1e4){return O("Motor "+e+" close for "+t+"ms",e),ue(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function Ft(e){return O("Motor "+e+" stopped",e),ue(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function Et(e){return Te("manualMode",!!e),O(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),ue("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function fo(e){return O("Motor "+e+" fault reset",e),he("motor_reset_fault",e)}function bo(e){return O("Motor "+e+" learned factors reset",e),he("motor_reset_learned_factors",e)}function ho(e){return O("Motor "+e+" reset and relearn started",e),he("motor_reset_and_relearn",e)}function vo(){return O("Adaptive balancing reset \u2014 learned factors back to 1.0"),he("reset_balancing")}function xo(){return O("Task stats dumped to device log"),he("dump_task_stats")}function At(){at()||fetch(rt+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Ke(e)}).catch(()=>{})}function Mt(){if(at())return;let e=eo();fetch(rt+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&Je(t.lines,t.next_seq)}).catch(()=>{})}function Ze(){at()||fetch(rt+"/forecast",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Qe(e)}).catch(()=>{})}var Nt=null,st=null,yo=null,wo=null,zo=null;async function Sr(){st&&st.abort(),st=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:st.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function So(e){if(!(!e||typeof e!="object")&&!Jt()){for(let t in e)x(t,e[t]);Be(!1)}}function _r(e){if(e){if(!e.type){So(e);return}if(e.type==="state"){So(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;O(t),String(t).indexOf("I2C_SCAN:")!==-1&&Pe(String(t))}}}function _o(){Nt||(Nt=setTimeout(()=>{Nt=null,Tt()},1e3))}function Tt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){so();return}Sr().then(t=>{De(!0),_r(t),At(),yo||(yo=setInterval(At,300*1e3)),Mt(),wo||(wo=setInterval(Mt,3e3)),Ze(),zo||(zo=setInterval(Ze,3600*1e3)),_o()}).catch(()=>{De(!1),_o()})}var ko=Object.create(null);function T(e,t){if(ko[e])return;ko[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}var it={en:{"nav.monitor":"Monitor","nav.zones":"Zones","nav.settings":"Settings","nav.diagnostics":"Diagnostics","status.synced":"Synced","status.saving":"Saving...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Uptime","meta.wifi":"WiFi","meta.heatSourceLastPush":"Heat Src Last Push","logs.deviceLogs":"Device Logs","logs.pause":"Pause","logs.resume":"Resume","logs.clear":"Clear","logs.waiting":"Waiting for device logs...","footer.product":"HEATVALVE-6 \xB7 UFH CONTROLLER","common.enabled":"Enabled","common.disabled":"Disabled","common.active":"active","common.idle":"idle","common.none":"None","common.ok":"OK","common.fault":"FAULT","common.on":"ON","common.off":"OFF","common.zone":"Zone","common.local":"local","common.peer":"peer","common.na":"n/a","common.noData":"No data","common.clockSyncing":"Clock syncing...","common.collectingHistory":"Collecting history...","common.decrease":"decrease","common.increase":"increase","common.secondsAgo":"{value}s ago","common.minutesAgo":"{value}m ago","form.unsaved":"Unsaved changes","form.discard":"Discard","form.apply":"Apply","overview.status.title":"Status","overview.status.motorDrivers":"Motor Drivers","overview.status.motorFault":"Motor Fault","overview.status.connection":"Connection","overview.connectivity.title":"Connectivity","overview.connectivity.ip":"IP Address","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC Address","overview.graph.flowReturnDemand":"Flow / Return / Demand","overview.graph.demandIndex":"Demand Index","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Return","overview.graph.layers.demand":"Demand","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Wind + dir","overview.graph.layers.solar":"Solar","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Demand","overview.graph.layers.forecast":"Forecast chart layers","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RET","overview.flowDiagram.dt":"\u0394T FLOW-RETURN","overview.weather.title":"Weather Forecast","overview.weather.notFetched":"No forecast fetched yet. Enable Forecast Preload in Settings and check the location.","overview.weather.updated":"Updated {time}","overview.weather.windArrows":"Wind direction arrows","overview.weather.tooltip.from":"From","overview.timeline.title":"Zone State","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"No history yet - data accumulates every 5 minutes.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.timeline.expectedState":"Expected state","overview.timeline.weatherPreload":"Weather preload","state.heating":"Heating","state.idle":"Idle","state.off":"Off","state.manual":"Manual","state.overheated":"Overheated","state.calibrating":"Calibrating","state.waitCal":"Wait Cal.","state.waitTemp":"Wait Temp","zone.detail.enabled":"Zone enabled","zone.detail.targetTemperature":"Target Temperature","zone.detail.currentTemp":"Current Temp","zone.detail.returnTemp":"Return Temp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motor learned parameters","zone.detail.openRipples":"Open Ripples","zone.detail.closeRipples":"Close Ripples","zone.detail.openFactor":"Open Factor","zone.detail.closeFactor":"Close Factor","zone.detail.preheatAdv":"Preheat Adv.","zone.detail.lastFault":"Last fault","zone.sensor.title":"Temperature Sensors / Connectivity","zone.sensor.returnSensor":"Zone Return Temperature Sensor","zone.sensor.tempSource":"Temperature Source","zone.sensor.bleSensor":"BLE Sensor","zone.sensor.bleNote":"Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanning...","zone.sensor.assign":"Assign","zone.sensor.assignedThisZone":"assigned to this zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.","zone.sensor.scanTimeout":"Scan timed out - device busy or BLE not responding. Try again.","zone.sensor.scanFailed":"Scan failed. Check device connectivity.","zone.sensor.mergeWith":"Merge With Zone","zone.sensor.mergeHelp":"merge into one room - mean temperature, valves open equally","zone.sensor.noMerge":"No room merge","zone.sensor.soloCaption":"This zone is controlled independently.","zone.sensor.followsCaption":"{zone} follows {target}: temperatures are averaged and valves use the primary zone opening.","zone.sensor.primaryCaption":"Group primary: {zone} controls {zones}. Temperatures are averaged and all grouped valves open equally.","zone.sensor.localProbe":"Local Probe","zone.sensor.bleSource":"BLE Sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GROUP +{count}","zone.card.groupedWith":"Grouped with {zones}","zone.card.fault":"Fault: {fault}","zone.room.title":"Zone Settings","zone.room.friendlyName":"Friendly Name","zone.room.friendlyPlaceholder":"e.g. Living Room","zone.room.area":"Zone Area (m\xB2)","zone.room.spacing":"Pipe Spacing C-C (mm)","zone.room.pipeType":"Pipe Type","zone.room.exteriorWalls":"Exterior Walls","zone.room.selectAll":"Select all that apply","zone.room.forecastPreload":"Forecast Preload","zone.room.windExposure":"Wind Exposure","zone.room.solarGain":"Solar Gain","zone.room.thermalLead":"Thermal Lead (h)","zone.room.note":"Wind exposure (0-1) is auto-seeded from the exterior walls above - edit it for a sheltered or extra-exposed site. Solar (0-1) is the passive sun gain that reduces preload; Lead h is how far ahead to start charging the slab before a forecast cold/wind peak.","settings.manifold.title":"Manifold Configuration","settings.manifold.help":"Manifold valve polarity (Normally Open/Closed) and which probes read the flow and return water temperature for the flow-return delta.","settings.manifold.type":"Manifold Type","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flow Probe","settings.manifold.returnProbe":"Return Probe","settings.manifold.probeTemps":"Probe Temperatures","settings.manifold.minZoneFlow":"Minimum Zone Flow","settings.manifold.minFlowEnabledSub":"manual floor for a modulating heat source, independent of the bridge","settings.manifold.minValveOpening":"Min valve opening (%)","settings.manifold.minValveOpeningSub":"floor held on every enabled zone while active","settings.asgard.title":"Modulating Heat Source","settings.asgard.help":"Pushes the house-weighted room temperature to a modulating heat-source controller. One board is the coordinator and aggregates zones from both boards; the other is a slave.","settings.asgard.bridgeEnabled":"Bridge enabled","settings.asgard.bridgeSub":"send weighted house temperature to the heat-source controller","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"pushes to the heat source","settings.asgard.endpoint":"Heat Source Endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for the weighted house temp","settings.asgard.peerBoard":"Peer board","settings.asgard.peerHost":"Peer host","settings.asgard.peerPlaceholder":"empty = single board","settings.asgard.pushInterval":"Push interval (s)","settings.asgard.recommendedSetpoint":"Recommended setpoint","settings.asgard.setpointNote":"Fixed value to set as the virtual thermostat setpoint - the area-weighted target of all enabled zones (derived from static zone settings, not live status).","settings.asgard.status":"Status","settings.asgard.peer":"Peer","settings.asgard.lastPush":"Last push","settings.asgard.zonesWeighted":"Zones weighted","settings.asgard.lastError":"Last error","settings.asgard.ageSeconds":"{value}s ago","settings.asgard.ageMinutes":"{value}m ago","settings.motor.title":"Motor Calibration & Learning","settings.motor.help":"Per-valve endstop learning and motor runtime profiles. Calibration drives each valve fully open and closed to learn its travel time and ripple count.","settings.motor.drivers":"Motor Drivers","settings.motor.toggleDrivers":"Toggle motor drivers","settings.motor.note":"Default starting thresholds and learning bounds used by the motor controller.","settings.motor.profile":"Profile","settings.motor.motorType":"Motor Type (Default Profile)","settings.motor.runtimeNote":"HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.","settings.motor.thresholds":"Thresholds & Learning","settings.motor.maxSafeRuntime":"Max Safe Runtime","settings.motor.closeThreshold":"Close Endstop Threshold","settings.motor.closeSlope":"Close Endstop Slope","settings.motor.closeSlopeFloor":"Close Endstop Slope Floor","settings.motor.openThreshold":"Open Endstop Threshold","settings.motor.openSlope":"Open Endstop Slope","settings.motor.openSlopeFloor":"Open Endstop Slope Floor","settings.motor.openRippleLimit":"Open Ripple Limit","settings.motor.relearnMovements":"Relearn After Movements","settings.motor.relearnHours":"Relearn After Hours","settings.motor.learnMinSamples":"Learned Factor Min Samples","settings.motor.learnMaxDeviation":"Learned Factor Max Deviation","settings.preheat.title":"Preheat","settings.preheat.help":"When hot water arrives but no zone is calling for heat, satisfied zones hold their opening instead of closing - absorbing heat an external optimiser pre-buffered, weighted by floor thermal mass.","settings.preheat.absorption":"Preheat Absorption","settings.preheat.toggle":"Toggle preheat absorption","settings.preheat.note":"When an external optimizer pushes hot water with no zone demanding heat, keeps satisfied zones open so the slab soaks it up instead of fighting it. Releases the instant any zone calls for heat.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.forecast.title":"Forecast Preload","settings.forecast.help":"Charges the slab before incoming weather: raises a zone setpoint when forecast wind on its exterior walls is about to spike. Solar gain offsets it. Fetched from Open-Meteo hourly.","settings.forecast.fetchNow":"Fetch Now","settings.forecast.fetching":"Fetching...","settings.forecast.lastFetch":"Last fetch: {time}","settings.forecast.windEnabled":"Wind preload enabled","settings.forecast.toggle":"Toggle forecast preload","settings.forecast.note":"Charges the slab before an incoming storm: raises a zone's setpoint when forecast wind hitting its exterior walls is about to spike. The fetched forecast is shown on the Monitor page.","settings.forecast.location":"Location","settings.forecast.latitude":"Latitude","settings.forecast.longitude":"Longitude","settings.forecast.model":"Model","settings.forecast.loadThreshold":"Load threshold","settings.forecast.maxOffset":"Max offset (\xB0C)","settings.forecast.perZoneNow":"Per-zone preload (now)","settings.forecast.zone":"Zone","settings.forecast.activeOffset":"Active offset","settings.forecast.zoneNote":"Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.","settings.balancing.title":"Hydraulic Balancing","settings.balancing.help":"Scales raw valve positions by pipe length and zone area so long loops get proportionally more flow. Adaptive mode tunes the factors over time.","settings.balancing.mode":"Balancing mode","settings.balancing.static":"Static","settings.balancing.adaptive":"Adaptive","settings.balancing.note":"Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top - no return probes - nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.","settings.balancing.perZone":"Per-zone factors","settings.balancing.prior":"Prior","settings.balancing.learned":"Learned","settings.balancing.effective":"Effective","settings.balancing.error":"Error","settings.balancing.factorNote":"Prior = static design factor \xB7 Learned = adaptive multiplier \xB7 Effective = prior \xD7 learned (the valve scale applied). Error is the long-window setpoint-room average a cold (+) loop is boosted on, a warm (-) loop throttled.","settings.balancing.tuning":"Adaptive tuning","settings.balancing.interval":"Update interval (s)","settings.balancing.step":"Step (k)","settings.balancing.minFactor":"Min factor","settings.balancing.maxFactor":"Max factor","settings.balancing.reset":"Reset balancing","settings.balancing.resetNote":"Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.","settings.control.title":"Device Control","settings.control.resetProbeMap":"Reset 1-Wire Probe Map","settings.control.dump1wire":"Dump 1-Wire Diagnostics","settings.control.restart":"Restart Device","diagnostics.activity.title":"General Activity / Log","diagnostics.activity.empty":"No activity yet.","diagnostics.i2c.title":"I2C Diagnostics","diagnostics.i2c.scan":"Scan I2C Bus","diagnostics.i2c.empty":"No scan has been run yet.","diagnostics.manual":"Manual Mode Active - Automatic Management Suspended","diagnostics.zoneSnapshot.title":"Zone Snapshot","diagnostics.zoneSnapshot.roomTemp":"Room Temp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} learned parameters","diagnostics.zoneSnapshot.preheatOn":"Preheat: On","diagnostics.zoneSnapshot.preheatOff":"Preheat: Off","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Free Heap (int)","diagnostics.system.psram":"Free PSRAM","diagnostics.system.dump":"Dump task stats to log","diagnostics.system.note":`Per-core load is sampled every 2 s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above - use it to find what saturates a core.`,"diagnostics.motor.title":"Motor Control","diagnostics.motor.manualNote":"Enable manual mode to suspend automatic management and unlock motor controls.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motor Target","diagnostics.motor.open10":"Open 10s","diagnostics.motor.close10":"Close 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Faults & Relearn","diagnostics.recovery.note":"Recover the selected zone's motor after a fault or bad calibration.","diagnostics.recovery.resetFault":"Reset Fault","diagnostics.recovery.resetFactors":"Reset Factors","diagnostics.recovery.resetRelearn":"Reset + Relearn","diagnostics.recovery.rejected":"Failed - device rejected the request","diagnostics.recovery.unreachable":"Failed - could not reach device","diagnostics.recovery.faultSent":"Fault reset sent for {zone}","diagnostics.recovery.factorsReset":"Learned factors reset for {zone}","diagnostics.recovery.relearnStarted":"Relearn started for {zone}","diagnostics.recovery.confirmFactors":"Reset learned factors for {zone}?","diagnostics.recovery.confirmRelearn":"Reset + relearn motor for {zone}?","diagnostics.preheatFactors.title":"Preheat Factors","diagnostics.preheatFactors.note":"Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat."},da:{"nav.monitor":"Monitor","nav.zones":"Zoner","nav.settings":"Indstillinger","nav.diagnostics":"Diagnostik","status.synced":"Synkroniseret","status.saving":"Gemmer...","status.live":"Live","status.offline":"Offline","status.mock":"Mock","meta.uptime":"Oppetid","meta.wifi":"WiFi","meta.heatSourceLastPush":"Varmekilde sidst sendt","logs.deviceLogs":"Enhedslogs","logs.pause":"Pause","logs.resume":"Forts\xE6t","logs.clear":"Ryd","logs.waiting":"Venter p\xE5 enhedslogs...","footer.product":"HEATVALVE-6 \xB7 UFH-STYRING","common.enabled":"Aktiveret","common.disabled":"Deaktiveret","common.active":"aktiv","common.idle":"inaktiv","common.none":"Ingen","common.ok":"OK","common.fault":"FEJL","common.on":"TIL","common.off":"FRA","common.zone":"Zone","common.local":"lokal","common.peer":"peer","common.na":"n/a","common.noData":"Ingen data","common.clockSyncing":"Synkroniserer ur...","common.collectingHistory":"Samler historik...","common.decrease":"s\xE6nk","common.increase":"h\xE6v","common.secondsAgo":"{value}s siden","common.minutesAgo":"{value}m siden","form.unsaved":"Ikke-gemte \xE6ndringer","form.discard":"Fortryd","form.apply":"Anvend","overview.status.title":"Status","overview.status.motorDrivers":"Motordrivere","overview.status.motorFault":"Motorfejl","overview.status.connection":"Forbindelse","overview.connectivity.title":"Forbindelse","overview.connectivity.ip":"IP-adresse","overview.connectivity.ssid":"SSID","overview.connectivity.mac":"MAC-adresse","overview.graph.flowReturnDemand":"Flow / Retur / Behov","overview.graph.demandIndex":"Behovsindeks","overview.graph.layers.flow":"Flow","overview.graph.layers.return":"Retur","overview.graph.layers.demand":"Behov","overview.graph.layers.temp":"Temp","overview.graph.layers.windDir":"Vind + retning","overview.graph.layers.solar":"Sol","overview.graph.axis.temp":"Temp","overview.graph.axis.demand":"Behov","overview.graph.layers.forecast":"Forecast-graflag","overview.flowDiagram.flow":"FLOW","overview.flowDiagram.returnShort":"RETUR","overview.flowDiagram.dt":"\u0394T FLOW-RETUR","overview.weather.title":"Vejrudsigt","overview.weather.notFetched":"Ingen forecast hentet endnu. Aktiver Forecast Preload i Indstillinger, og kontroller placeringen.","overview.weather.updated":"Opdateret {time}","overview.weather.windArrows":"Vindretning pile","overview.weather.tooltip.from":"Fra","overview.timeline.title":"Zonetilstand","overview.timeline.absorb":"Absorb","overview.timeline.noHistory":"Ingen historik endnu - data samles hvert 5. minut.","overview.timeline.preheatAbsorption":"Preheat absorption","overview.timeline.expectedState":"Forventet tilstand","overview.timeline.weatherPreload":"Vejr-preload","state.heating":"Varmer","state.idle":"Idle","state.off":"Fra","state.manual":"Manuel","state.overheated":"Overophedet","state.calibrating":"Kalibrerer","state.waitCal":"Venter kal.","state.waitTemp":"Venter temp","zone.detail.enabled":"Zone aktiveret","zone.detail.targetTemperature":"M\xE5ltemperatur","zone.detail.currentTemp":"Aktuel temp","zone.detail.returnTemp":"Returtemp","zone.detail.flowPct":"Flow %","zone.detail.motorLearned":"Motorens l\xE6rte parametre","zone.detail.openRipples":"\xC5bne ripples","zone.detail.closeRipples":"Lukke ripples","zone.detail.openFactor":"\xC5bne faktor","zone.detail.closeFactor":"Lukke faktor","zone.detail.preheatAdv":"Preheat adv.","zone.detail.lastFault":"Seneste fejl","zone.sensor.title":"Temperatursensorer / Forbindelse","zone.sensor.returnSensor":"Zone returtemperatursensor","zone.sensor.tempSource":"Temperaturkilde","zone.sensor.bleSensor":"BLE-sensor","zone.sensor.bleNote":"Par en n\xE6rliggende BTHome-sensor (Shelly BLU H&T), eller indtast MAC manuelt.","zone.sensor.scan":"Scan","zone.sensor.scanning":"Scanner...","zone.sensor.assign":"Tildel","zone.sensor.assignedThisZone":"tildelt denne zone","zone.sensor.zoneBadge":"zone {zone}","zone.sensor.noSensors":"Ingen BTHome-sensorer fundet i n\xE6rheden. S\xF8rg for friske batterier, og at sensorerne er inden for r\xE6kkevidde.","zone.sensor.scanTimeout":"Scan timed out - enheden er optaget, eller BLE svarer ikke. Pr\xF8v igen.","zone.sensor.scanFailed":"Scan fejlede. Kontroller enhedens forbindelse.","zone.sensor.mergeWith":"Flet med zone","zone.sensor.mergeHelp":"flet til \xE9t rum - middeltemperatur, ventiler \xE5bner ens","zone.sensor.noMerge":"Ingen rumfletning","zone.sensor.soloCaption":"Denne zone styres selvst\xE6ndigt.","zone.sensor.followsCaption":"{zone} f\xF8lger {target}: temperaturer gennemsnittes, og ventiler bruger prim\xE6rzonens \xE5bning.","zone.sensor.primaryCaption":"Gruppeprim\xE6r: {zone} styrer {zones}. Temperaturer gennemsnittes, og alle grupperede ventiler \xE5bner ens.","zone.sensor.localProbe":"Lokal probe","zone.sensor.bleSource":"BLE-sensor","zone.card.linkZone":"LINK Z{zone}","zone.card.groupCount":"GRUPPE +{count}","zone.card.groupedWith":"Grupperet med {zones}","zone.card.fault":"Fejl: {fault}","zone.room.title":"Zoneindstillinger","zone.room.friendlyName":"Venligt navn","zone.room.friendlyPlaceholder":"fx Stue","zone.room.area":"Zoneareal (m\xB2)","zone.room.spacing":"R\xF8rafstand C-C (mm)","zone.room.pipeType":"R\xF8rtype","zone.room.exteriorWalls":"Yderv\xE6gge","zone.room.selectAll":"V\xE6lg alle relevante","zone.room.forecastPreload":"Forecast preload","zone.room.windExposure":"Vindeksponering","zone.room.solarGain":"Solindfald","zone.room.thermalLead":"Termisk lead (t)","zone.room.note":"Vindeksponering (0-1) auto-seedes fra yderv\xE6ggene ovenfor - juster den for l\xE6 eller ekstra udsat placering. Sol (0-1) er passivt solindfald, der reducerer preload; lead t er hvor tidligt pladen skal lades f\xF8r en forecast kulde-/vindtop.","settings.manifold.title":"Manifold-konfiguration","settings.manifold.help":"Manifoldens ventilpolaritet (Normally Open/Closed), og hvilke prober der m\xE5ler flow- og returvandtemperatur til flow-retur-delta.","settings.manifold.type":"Manifoldtype","settings.manifold.normallyOpen":"Normally Open (NO)","settings.manifold.normallyClosed":"Normally Closed (NC)","settings.manifold.flowProbe":"Flowprobe","settings.manifold.returnProbe":"Returprobe","settings.manifold.probeTemps":"Probetemperaturer","settings.manifold.minZoneFlow":"Minimum zoneflow","settings.manifold.minFlowEnabledSub":"manuel minimumsflow for modulerende varmekilde, uafh\xE6ngigt af bridge","settings.manifold.minValveOpening":"Min ventil\xE5bning (%)","settings.manifold.minValveOpeningSub":"minimum holdt p\xE5 hver aktiv zone mens aktiv","settings.asgard.title":"Modulerende varmekilde","settings.asgard.help":"Sender husets v\xE6gtede rumtemperatur til en modulerende varmekilde-controller. \xC9t board er coordinator og samler zoner fra begge boards; det andet er slave.","settings.asgard.bridgeEnabled":"Bridge aktiveret","settings.asgard.bridgeSub":"send v\xE6gtet hustemperatur til varmekilde-controlleren","settings.asgard.coordinator":"Coordinator","settings.asgard.coordinatorSub":"sender til varmekilden","settings.asgard.endpoint":"Varmekilde endpoint","settings.asgard.host":"Host","settings.asgard.port":"Port","settings.asgard.entity":"Number entity","settings.asgard.entitySub":"REST object_id for v\xE6gtet hustemp","settings.asgard.peerBoard":"Peer-board","settings.asgard.peerHost":"Peer-host","settings.asgard.peerPlaceholder":"tom = enkelt board","settings.asgard.pushInterval":"Push-interval (s)","settings.asgard.recommendedSetpoint":"Anbefalet setpunkt","settings.asgard.setpointNote":"Fast v\xE6rdi til virtuel termostat-setpunkt - arealv\xE6gtet m\xE5l for alle aktive zoner (beregnet fra statiske zoneindstillinger, ikke live status).","settings.asgard.status":"Status","settings.asgard.peer":"Peer","settings.asgard.lastPush":"Seneste push","settings.asgard.zonesWeighted":"V\xE6gtede zoner","settings.asgard.lastError":"Seneste fejl","settings.asgard.ageSeconds":"{value}s siden","settings.asgard.ageMinutes":"{value}m siden","settings.motor.title":"Motor-kalibrering & l\xE6ring","settings.motor.help":"Endstop-l\xE6ring og motor-runtime-profiler pr. ventil. Kalibrering k\xF8rer hver ventil helt \xE5ben og lukket for at l\xE6re vandringstid og ripple count.","settings.motor.drivers":"Motordrivere","settings.motor.toggleDrivers":"Skift motordrivere","settings.motor.note":"Standard startt\xE6rskler og l\xE6ringsgr\xE6nser brugt af motorcontrolleren.","settings.motor.profile":"Profil","settings.motor.motorType":"Motortype (standardprofil)","settings.motor.runtimeNote":"HmIP-VDMot sikkerhed: runtime er l\xE5st til 40s for at undg\xE5 piston-overtravel. Generic tillader redigerbar runtime.","settings.motor.thresholds":"T\xE6rskler & l\xE6ring","settings.motor.maxSafeRuntime":"Maks sikker runtime","settings.motor.closeThreshold":"Lukke endstop-t\xE6rskel","settings.motor.closeSlope":"Lukke endstop-slope","settings.motor.closeSlopeFloor":"Lukke endstop-slope floor","settings.motor.openThreshold":"\xC5bne endstop-t\xE6rskel","settings.motor.openSlope":"\xC5bne endstop-slope","settings.motor.openSlopeFloor":"\xC5bne endstop-slope floor","settings.motor.openRippleLimit":"\xC5bne ripplegr\xE6nse","settings.motor.relearnMovements":"Genl\xE6r efter bev\xE6gelser","settings.motor.relearnHours":"Genl\xE6r efter timer","settings.motor.learnMinSamples":"L\xE6rt faktor min samples","settings.motor.learnMaxDeviation":"L\xE6rt faktor maks afvigelse","settings.preheat.title":"Preheat","settings.preheat.help":"N\xE5r varmt vand kommer, men ingen zone kalder p\xE5 varme, holder tilfredse zoner deres \xE5bning i stedet for at lukke - absorberer varme som en ekstern optimizer har pre-bufferet, v\xE6gtet af gulvets termiske masse.","settings.preheat.absorption":"Preheat absorption","settings.preheat.toggle":"Skift preheat absorption","settings.preheat.note":"N\xE5r en ekstern optimizer sender varmt vand uden varmebehov fra zoner, holdes tilfredse zoner \xE5bne, s\xE5 pladen suger varmen op i stedet for at modarbejde den. Frigives straks n\xE5r en zone kalder p\xE5 varme.","settings.preheat.absorbBand":"Absorb band (\xB0C)","settings.preheat.detectDelta":"Detect delta (\xB0C)","settings.forecast.title":"Forecast preload","settings.forecast.help":"Lader pladen f\xF8r indkommende vejr: h\xE6ver zone-setpunkt n\xE5r forecast vind p\xE5 yderv\xE6gge snart topper. Solindfald modregner. Hentes fra Open-Meteo timevis.","settings.forecast.fetchNow":"Hent nu","settings.forecast.fetching":"Henter...","settings.forecast.lastFetch":"Senest hentet: {time}","settings.forecast.windEnabled":"Vind-preload aktiveret","settings.forecast.toggle":"Skift forecast preload","settings.forecast.note":"Lader pladen f\xF8r en kommende storm: h\xE6ver zonens setpunkt n\xE5r forecast vind p\xE5 yderv\xE6ggene snart topper. Det hentede forecast vises p\xE5 Monitor-siden.","settings.forecast.location":"Placering","settings.forecast.latitude":"Breddegrad","settings.forecast.longitude":"L\xE6ngdegrad","settings.forecast.model":"Model","settings.forecast.loadThreshold":"Load-t\xE6rskel","settings.forecast.maxOffset":"Maks offset (\xB0C)","settings.forecast.perZoneNow":"Preload pr. zone (nu)","settings.forecast.zone":"Zone","settings.forecast.activeOffset":"Aktiv offset","settings.forecast.zoneNote":"Live forecast-preload offset anvendt p\xE5 hver zone lige nu (timer-frem tallet er n\xE5r load-toppen ventes). Vindeksponering, solindfald og termisk lead pr. zone indstilles i Zone-kortet ved Yderv\xE6gge.","settings.balancing.title":"Hydraulisk balancering","settings.balancing.help":"Skalerer r\xE5 ventilpositioner efter r\xF8rl\xE6ngde og zoneareal, s\xE5 lange sl\xF8jfer f\xE5r proportionalt mere flow. Adaptive mode tuner faktorerne over tid.","settings.balancing.mode":"Balanceringsmode","settings.balancing.static":"Statisk","settings.balancing.adaptive":"Adaptiv","settings.balancing.note":"Statisk fordeler flow fra den modstandsbaserede designmodel (areal, r\xF8r, gulv). Adaptiv l\xE6gger en langsom rumtemperatur-korrektion ovenp\xE5 - uden returprober - og nudger kronisk kolde sl\xF8jfer \xE5bne og overforsynede sl\xF8jfer lukkede over dage. Den omfordeler kun flow mellem sl\xF8jfer og h\xE6ver aldrig samlet behov.","settings.balancing.perZone":"Faktorer pr. zone","settings.balancing.prior":"Prior","settings.balancing.learned":"L\xE6rt","settings.balancing.effective":"Effektiv","settings.balancing.error":"Fejl","settings.balancing.factorNote":"Prior = statisk designfaktor \xB7 L\xE6rt = adaptiv multiplier \xB7 Effektiv = prior \xD7 l\xE6rt (ventilskalaen der anvendes). Fejl er langtidsvindue setpunkt-rumgennemsnit, hvor en kold (+) sl\xF8jfe boostes og en varm (-) sl\xF8jfe drosles.","settings.balancing.tuning":"Adaptiv tuning","settings.balancing.interval":"Opdateringsinterval (s)","settings.balancing.step":"Step (k)","settings.balancing.minFactor":"Min faktor","settings.balancing.maxFactor":"Maks faktor","settings.balancing.reset":"Nulstil balancering","settings.balancing.resetNote":"Reset rydder alle sl\xF8jfers l\xE6rte multiplier tilbage til 1.0 (genl\xE6res over dage). Step begr\xE6nser bev\xE6gelsen pr. opdatering; konvergens er bevidst langsom for at matche pladens termiske tr\xE6ghed.","settings.control.title":"Enhedskontrol","settings.control.resetProbeMap":"Nulstil 1-Wire probe-map","settings.control.dump1wire":"Dump 1-Wire diagnostics","settings.control.restart":"Genstart enhed","diagnostics.activity.title":"Generel aktivitet / Log","diagnostics.activity.empty":"Ingen aktivitet endnu.","diagnostics.i2c.title":"I2C-diagnostik","diagnostics.i2c.scan":"Scan I2C-bus","diagnostics.i2c.empty":"Der er ikke k\xF8rt et scan endnu.","diagnostics.manual":"Manuel tilstand aktiv - automatisk styring er suspenderet","diagnostics.zoneSnapshot.title":"Zone-snapshot","diagnostics.zoneSnapshot.roomTemp":"Rumtemp","diagnostics.zoneSnapshot.motorLearned":"Motor {zone} l\xE6rte parametre","diagnostics.zoneSnapshot.preheatOn":"Preheat: Til","diagnostics.zoneSnapshot.preheatOff":"Preheat: Fra","diagnostics.system.title":"System","diagnostics.system.cpu0":"CPU Core 0","diagnostics.system.cpu1":"CPU Core 1","diagnostics.system.heap":"Fri heap (int)","diagnostics.system.psram":"Fri PSRAM","diagnostics.system.dump":"Dump task stats til log","diagnostics.system.note":'Load pr. core samples hvert 2. sekund. "Dump task stats" logger alle tasks CPU% og stack-headroom til enhedsloggen ovenfor - brug det til at finde hvad der m\xE6tter en core.',"diagnostics.motor.title":"Motorstyring","diagnostics.motor.manualNote":"Aktiver manuel tilstand for at suspendere automatisk styring og l\xE5se motorstyring op.","diagnostics.motor.motor":"Motor","diagnostics.motor.target":"Motorm\xE5l","diagnostics.motor.open10":"\xC5bn 10s","diagnostics.motor.close10":"Luk 10s","diagnostics.motor.stop":"Stop","diagnostics.recovery.title":"Fejl & genl\xE6ring","diagnostics.recovery.note":"Gendan den valgte zones motor efter fejl eller d\xE5rlig kalibrering.","diagnostics.recovery.resetFault":"Nulstil fejl","diagnostics.recovery.resetFactors":"Nulstil faktorer","diagnostics.recovery.resetRelearn":"Nulstil + genl\xE6r","diagnostics.recovery.rejected":"Fejlede - enheden afviste anmodningen","diagnostics.recovery.unreachable":"Fejlede - kunne ikke n\xE5 enheden","diagnostics.recovery.faultSent":"Fejlnulstilling sendt for {zone}","diagnostics.recovery.factorsReset":"L\xE6rte faktorer nulstillet for {zone}","diagnostics.recovery.relearnStarted":"Genl\xE6ring startet for {zone}","diagnostics.recovery.confirmFactors":"Nulstil l\xE6rte faktorer for {zone}?","diagnostics.recovery.confirmRelearn":"Nulstil + genl\xE6r motor for {zone}?","diagnostics.preheatFactors.title":"Preheat-faktorer","diagnostics.preheatFactors.note":"L\xE6rt simple-preheat forspring pr. zone. Styringen k\xF8rer automatisk; disse v\xE6rdier viser hvor meget tidligere hvert rum begynder at kalde p\xE5 varme."}},Lo="en".toLowerCase(),Dt=it[Lo]?Lo:"en";function v(e,t){let o=it[Dt]&&it[Dt][e]||it.en[e]||e;return t?String(o).replace(/\{(\w+)\}/g,(r,n)=>t[n]==null?"":String(t[n])):o}function E(e){e&&(e.querySelectorAll("[data-i18n]").forEach(t=>{t.textContent=v(t.getAttribute("data-i18n"))}),e.querySelectorAll("[data-i18n-title]").forEach(t=>{t.setAttribute("title",v(t.getAttribute("data-i18n-title")))}),e.querySelectorAll("[data-i18n-label]").forEach(t=>{t.setAttribute("aria-label",v(t.getAttribute("data-i18n-label")))}),e.querySelectorAll("[data-i18n-placeholder]").forEach(t=>{t.setAttribute("placeholder",v(t.getAttribute("data-i18n-placeholder")))}))}typeof document!="undefined"&&document.documentElement.setAttribute("lang",Dt);var kr=`
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
  border: 1.5px solid rgba(180,180,180,.55);
  color: rgba(210,210,220,.9);
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
  background: rgba(4,18,28,.97);
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
  box-shadow: 0 8px 24px rgba(0,0,0,.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease;
  z-index: 60;
}
.help-badge:hover .help-tip, .help-badge:focus-visible .help-tip { opacity: 1; }

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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
}

.ui-unit { color: var(--text-faint); font-size: .72rem; font-weight: 600; }

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
  background: rgba(255,166,0,.12);
  border: 1px solid rgba(255,166,0,.42);
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
.ui-form-apply { background: var(--accent); color: #042a3b; border-color: var(--accent); }
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
  background: #efe6dd;
  border-radius: 999px;
  transition: transform .2s ease;
}
.ui-toggle.on { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.ui-toggle.on::after { transform: translateX(22px); background: #042a3b; }

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
.ui-btn:hover { background: var(--control-bg-hover); border-color: rgba(120,146,200,.52); }
.ui-btn.warn { border-color: rgba(255,118,118,.5); background: rgba(255,118,118,.2); color: #FFD9D9; }
.ui-btn.warn:hover { background: rgba(255,100,100,.3); border-color: rgba(255,100,100,.6); }

@media (max-width: 520px) {
  .ui-row { align-items: flex-start; flex-direction: column; gap: 6px; }
  .ui-field { align-self: stretch; }
  .ui-input, .ui-select { width: 100%; max-width: none; }
  .ui-stepper { width: 100%; }
  .ui-stepper .ui-input { flex: 1; width: auto; }
}
`;T("ui-kit",kr);function ve(e){let t=v(e);return`<span class="help-badge" tabindex="0" role="img" aria-label="${String(t).replace(/"/g,"&quot;")}" data-i18n-label="${e}">?<span class="help-tip" data-i18n="${e}">${t}</span></span>`}function Lr(e,t){let o=Math.abs(Number(e));return!Number.isFinite(o)||o<1e3?t:Math.pow(10,Math.floor(Math.log10(o))-1)}function Cr(e){let t=String(e),o=t.indexOf(".");return o<0?0:t.length-o-1}function ce(e,t={}){let o=e.querySelector(t.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg" data-i18n="form.unsaved">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard" data-i18n="form.discard">Discard</button><button type="button" class="ui-form-apply" data-i18n="form.apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):e.insertAdjacentElement("afterbegin",r);let n=[],c=()=>r.classList.toggle("show",n.some(d=>d.dirty)),s=(d,S)=>{d.dirty=S,c()};function m(d){return d.markDirty=()=>s(d,!0),n.push(d),d}function l(d,S){let L={dirty:!1,input:d},h=S.baseStep!=null?S.baseStep:parseFloat(d.step)||1,b=Cr(h),C=S.min!=null?S.min:d.min!==""?parseFloat(d.min):-1/0,N=S.max!=null?S.max:d.max!==""?parseFloat(d.max):1/0,R=q=>b>0?Number(q).toFixed(b):String(Math.round(Number(q)));if(!S.nostep){let q=document.createElement("div");q.className="ui-stepper",d.parentNode.insertBefore(q,d);let F=document.createElement("button");F.type="button",F.className="ui-step-btn",F.textContent="\u2212",F.tabIndex=-1,F.setAttribute("aria-label",v("common.decrease"));let A=document.createElement("button");A.type="button",A.className="ui-step-btn",A.textContent="+",A.tabIndex=-1,A.setAttribute("aria-label",v("common.increase")),q.appendChild(F),q.appendChild(d),q.appendChild(A),d.readOnly=!0;let M=j=>{if(d.disabled)return;let Y=parseFloat(d.value);Number.isFinite(Y)||(Y=parseFloat(d.placeholder)),Number.isFinite(Y)||(Y=0);let ae=Math.min(N,Math.max(C,Y+j*Lr(Y,h)));d.value=R(ae),s(L,!0)};F.addEventListener("click",()=>M(-1)),A.addEventListener("click",()=>M(1)),d.addEventListener("dblclick",()=>{d.disabled||(d.readOnly=!1,d.classList.add("editing"),d.focus(),d.select())}),d.addEventListener("blur",()=>{d.readOnly=!0,d.classList.remove("editing")}),d.addEventListener("keydown",j=>{j.key==="Enter"&&d.blur()})}return d.addEventListener("input",()=>s(L,!0)),L.sync=()=>{let q=S.read();d.value=q!=null&&Number.isFinite(Number(q))?R(q):""},L.commit=()=>{let q=parseFloat(d.value);Number.isFinite(q)&&S.commit(Math.min(N,Math.max(C,q)))},m(L)}function p(d,S){let L={dirty:!1,input:d};return d.addEventListener("input",()=>s(L,!0)),L.sync=()=>{let h=S.read();d.value=h!=null?h:""},L.commit=()=>S.commit(d.value.trim()),m(L)}function u(d,S){let L={dirty:!1,input:d};return d.addEventListener("change",()=>s(L,!0)),L.sync=()=>{let h=S.read();h!=null&&(d.value=h)},L.commit=()=>S.commit(d.value),m(L)}function w(d,S){let L={dirty:!1,input:d,staged:!1},h=d.closest(".ui-row"),b=()=>{d.classList.toggle("on",L.staged),h&&h.classList.toggle("is-on",L.staged),d.setAttribute("aria-checked",L.staged?"true":"false"),S.onChange&&S.onChange(L.staged)};return d.addEventListener("click",()=>{L.staged=!L.staged,s(L,!0),b()}),L.sync=()=>{L.staged=!!S.read(),b()},L.commit=()=>S.commit(L.staged),m(L)}function y(d){let S={dirty:!1,sync:d.sync,commit:d.commit};return m(S)}let f=()=>n.forEach(d=>{!d.dirty&&d.sync&&d.sync()}),g=()=>{n.forEach(d=>{d.dirty&&(d.commit&&d.commit(),d.dirty=!1)}),c(),t.onApply&&t.onApply()},_=()=>{n.forEach(d=>{d.dirty=!1,d.sync&&d.sync()}),c(),t.onDiscard&&t.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",g),r.querySelector(".ui-form-discard").addEventListener("click",_),E(r),{num:l,text:p,select:u,toggle:w,custom:y,refresh:f,apply:g,discard:_,isDirty:()=>n.some(d=>d.dirty)}}function fe(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function lt(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function ct(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function Co(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}function Fo(e){if(e==null||isNaN(e))return"hh:mm";let t=Math.round(Date.now()/1e3-e),o=new Date(t*1e3),r=n=>String(n).padStart(2,"0");return`${r(o.getHours())}:${r(o.getMinutes())}`}var Fr=`
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
  background: rgba(0,63,92,.54);
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
  background: rgba(0,84,120,.56);
  border-color: rgba(120,146,200,.52);
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
  border: 1px solid rgba(120,146,200,.32);
  background: rgba(0,63,92,.48);
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
  border-color: rgba(121,209,126,.25);
  background: rgba(20,52,34,.42);
}

.meta-chip-state.saving {
  color: var(--state-warn);
  border-color: rgba(255,133,49,.35);
  background: rgba(83,56,20,.42);
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,146,200,.24);
  background: rgba(0,63,92,.32);
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
  box-shadow: 0 0 12px rgba(121,209,126,.55);
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
`;T("hv6-header",Fr);var Er=()=>`
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
`,ps=P({tag:"hv6-header",render:Er,onMount(e,t){let o=t.querySelector("#hdr-dot"),r=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),c=t.querySelector("#hdr-wifi"),s=t.querySelector("#hdr-asgard"),m=t.querySelector("#hdr-asgard-val"),l=t.querySelector("#hdr-asgard-time"),p=t.querySelector("#hdr-fw"),u=t.querySelectorAll(".menu-link");function w(){let f=Z("section");u.forEach(g=>{g.classList.toggle("active",g.getAttribute("data-section")===f)})}function y(){let f=Z("live"),g=Z("pendingWrites"),_=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!f);let d,S;g>0?(d=v("status.saving"),S="saving"):_?(d=window.HV6_DASHBOARD_CONFIG.mockLabel||v("status.mock"),S="synced"):f?(d=v("status.live"),S="synced"):(d=v("status.offline"),S="offline"),r.textContent=d,r.className="meta-chip meta-chip-state "+S,n.textContent=ct(k(a.uptime)),c.textContent=Co(k(a.wifi));let L=k(a.asgardLastPushC),h=k(a.asgardLastPushAgeS),b=K(a.asgardEnabled)&&L!=null&&Number.isFinite(L);s.hidden=!b,b&&(m.textContent=L.toFixed(2)+"\xB0C",l.textContent=Fo(h));let C=Z("firmwareVersion")||D(a.firmware);p.textContent=C?"FW "+C:""}u.forEach(f=>{f.addEventListener("click",g=>{g.preventDefault(),Xt(f.getAttribute("data-section"))})}),I("section",w),I("live",y),I("pendingWrites",y),I("firmwareVersion",y),z(a.uptime,y),z(a.wifi,y),z(a.asgardLastPushC,y),z(a.asgardLastPushAgeS,y),z(a.asgardEnabled,y),z(a.firmware,y),w(),E(t),y()}});var Ar=`
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
  background: #efe6dd;
  border-radius: 999px;
  transition: .2s ease;
}
.status-card .sw.on {
  background: var(--blue);
  border-color: rgba(124,155,208,.4);
}
.status-card .sw.on::after {
  transform: translateX(16px);
  background: #042a3b;
}
.status-card .sw.off {
  background: var(--state-danger);
  border-color: rgba(255,100,100,.3);
}
.status-card .dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: rgba(120,146,200,.35);
  transition: .2s ease;
  flex-shrink: 0;
  display: inline-block;
}
.status-card .dot.on {
  background: var(--blue);
  box-shadow: 0 0 12px rgba(124,155,208,.55);
}
`;T("status-card",Ar);var Mr=e=>`
  <div class="card status-card">
    <div class="card-title" data-i18n="overview.status.title">Status</div>
    <table class="st">
      <tr>
        <td data-i18n="overview.status.motorDrivers">Motor Drivers</td>
        <td>
          <div class="drv-toggle">
            <span id="sys-drv">${e.motorDrivers}</span>
            <div class="sw ${e.motorDriversOn?"on":"off"}" id="sw-drv"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td data-i18n="overview.status.motorFault">Motor Fault</td>
        <td id="sys-fault">${e.motorFault}</td>
      </tr>
      <tr>
        <td data-i18n="overview.status.connection">Connection</td>
        <td id="sys-conn"><span class="dot ${e.connOn?"on":""}" id="sys-dot"></span></td>
      </tr>
    </table>
  </div>
`,xs=P({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Mr,methods:{update(e){this.motorDriversOn=K(a.drivers),this.motorDrivers=this.motorDriversOn?v("common.on"):v("common.off"),this.motorFault=K(a.fault)?v("common.fault"):v("common.ok"),this.connOn=Z("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let o={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},r=()=>e.update(o);z(a.drivers,r),z(a.fault,r),I("live",r),o.sw.onclick=()=>{nt(!e.motorDriversOn)},E(t),r()}});var Nr=`
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
`;T("connectivity-card",Nr);var Tr=()=>`
  <div class="connectivity-card">
    <div class="card-title" data-i18n="overview.connectivity.title">Connectivity</div>
    <table class="st">
      <tr><td data-i18n="overview.connectivity.ip">IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td data-i18n="overview.connectivity.mac">MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td data-i18n="meta.uptime">Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Cs=P({tag:"connectivity-card",render:Tr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),n=t.querySelector(".cc-mac"),c=t.querySelector(".cc-up");function s(){o.textContent=D(a.ip)||"---",r.textContent=D(a.ssid)||"---",n.textContent=D(a.mac)||"---",c.textContent=ct(k(a.uptime))}z(a.ip,s),z(a.ssid,s),z(a.mac,s),z(a.uptime,s),E(t),s()}});var Dr="http://www.w3.org/2000/svg",Pr=`
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
  background: rgba(4,18,28,.94);
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
`;T("chart-kit",Pr);function $(e,t,o){let r=document.createElementNS(Dr,e);if(t)for(let n in t)r.setAttribute(n,t[n]);return o!=null&&(r.textContent=o),r}function qe(e){if(!e.length)return"";if(e.length<3)return"M "+e.map(r=>`${r.x.toFixed(2)} ${r.y.toFixed(2)}`).join(" L ");let t=.16,o=`M ${e[0].x.toFixed(2)} ${e[0].y.toFixed(2)}`;for(let r=0;r<e.length-1;r++){let n=e[r-1]||e[r],c=e[r],s=e[r+1],m=e[r+2]||s,l=c.x+(s.x-n.x)*t,p=c.y+(s.y-n.y)*t,u=s.x-(m.x-c.x)*t,w=s.y-(m.y-c.y)*t;o+=` C ${l.toFixed(2)} ${p.toFixed(2)}, ${u.toFixed(2)} ${w.toFixed(2)}, ${s.x.toFixed(2)} ${s.y.toFixed(2)}`}return o}function Eo(e,t,o){let r=e.filter(m=>Number.isFinite(m));if(!r.length)return{min:t,max:o};let n=Math.min(...r),c=Math.max(...r);n===c&&(n-=1,c+=1);let s=(c-n)*.12;return{min:n-s,max:c+s}}function dt(e,t,o){let r=document.createElement("div");r.className="chart-tooltip",t.appendChild(r);let n=$("g",{class:"chart-cursor",style:"display:none"}),c=$("line",{class:"chart-cursor-line",y1:o.plotTop,y2:o.plotBottom});n.appendChild(c);let s=[];e.appendChild(n);function m(w){let y=0,f=1/0;for(let g=0;g<o.count;g++){let _=Math.abs(w-o.xAt(g));_<f&&(f=_,y=g)}return y}function l(w){let y=e.getScreenCTM();if(!y)return null;let f=e.createSVGPoint();return f.x=w.clientX,f.y=w.clientY,f.matrixTransform(y.inverse())}function p(w){if(!o.count)return;let y=l(w);if(!y)return;let f=m(y.x),g=o.xAt(f);c.setAttribute("x1",g),c.setAttribute("x2",g);let _=o.dots(f);for(;s.length<_.length;){let h=$("circle",{class:"chart-cursor-dot",r:3.4});n.appendChild(h),s.push(h)}s.forEach((h,b)=>{b<_.length?(h.setAttribute("cx",g),h.setAttribute("cy",_[b].y),h.setAttribute("fill",_[b].color),h.style.display=""):h.style.display="none"}),n.style.display="";let d=o.rows(f).map(h=>`<div class="tt-row"><span class="tt-swatch" style="background:${h.color}"></span>${h.label}<span class="tt-val">${h.value}</span></div>`).join("");r.innerHTML=`<div class="tt-time">${o.label(f)}</div>${d}`,r.classList.add("show");let S=t.getBoundingClientRect(),L=w.clientX-S.left+14;L+r.offsetWidth>S.width-6&&(L=w.clientX-S.left-r.offsetWidth-14),r.style.left=Math.max(6,L)+"px",r.style.top=Math.max(6,w.clientY-S.top+12)+"px"}function u(){r.classList.remove("show"),n.style.display="none"}return e.addEventListener("pointermove",p),e.addEventListener("pointerleave",u),()=>{e.removeEventListener("pointermove",p),e.removeEventListener("pointerleave",u),r.remove()}}var je=1e3,Pt=180,ye=14,Or=42,Rr=44,Le=42,mt=je-Le-Or,ke=Pt-ye-Rr,Me=ye+ke,Ot=24*3600,Ao=se+2,Mo=se+3,pt=se+4,Hr="var(--series-warm)",qr="var(--series-cool)",No="var(--series-solar)",Ir=`
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
`;T("graph-widgets",Ir);var To=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.flowReturnDemand">Flow / Return / Demand</span><span class="chart-sub gw-dt">\u2014</span></div><div class="gw-controls" role="toolbar" data-i18n-label="overview.graph.layers.forecast" aria-label="Flow chart layers"><button type="button" class="gw-toggle" data-layer="flow" aria-pressed="true" data-i18n="overview.graph.layers.flow">Flow</button><button type="button" class="gw-toggle" data-layer="return" aria-pressed="true" data-i18n="overview.graph.layers.return">Return</button><button type="button" class="gw-toggle" data-layer="demand" aria-pressed="true" data-i18n="overview.graph.layers.demand">Demand</button></div><svg class="gw-flow"></svg></div>',Do=()=>'<div class="chart-card"><div class="chart-head"><span class="chart-title" data-i18n="overview.graph.demandIndex">Demand Index</span><span class="chart-sub gw-demand-text">\u2014</span></div><svg class="gw-demand"></svg></div>',Br=e=>e.variant==="flow-return"?`<div class="graph-widgets">${To()}</div>`:e.variant==="demand"?`<div class="graph-widgets">${Do()}</div>`:`<div class="graph-widgets">${To()}${Do()}</div>`;function Po(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1):"\u2014"}function Wr(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"\xB0":"\u2014"}function Rt(e,t,o){let r=[];for(let n=0;n<e.length;n++){let c=e[n];if(!c||c[0]<o)continue;let s=c[t];s==null||!Number.isFinite(s)||r.push({t:c[0],v:s})}return r}var gt=(e,t)=>Le+Math.max(0,Math.min(1,(e-t)/Ot))*mt;function Zr(e,t,o){let r=Number(Date.now()/1e3)|0,n=3600,c=Math.ceil((r-Ot)/n)*n,s=Math.floor(r/n)*n,m=Math.floor(r/n)*n;for(let p=c;p<=s;p+=n){let u=o-(r-p),w=gt(u,t),y=new Date(p*1e3),f=p===m,g=Me+16;e.appendChild($("text",{x:w,y:g,"text-anchor":"end",transform:`rotate(-45 ${w.toFixed(1)} ${g})`,class:"chart-hour"+(f?" now":"")},String(y.getHours()).padStart(2,"0")))}let l=gt(o,t);e.appendChild($("line",{x1:l,y1:ye,x2:l,y2:Me,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"}))}function jr(e){let t=[];if(e.forEach(c=>c.forEach(s=>t.push(s.v))),!t.length)return{min:0,max:10};let o=Math.min(...t),r=Math.max(...t);o===r&&(o-=.5,r+=.5);let n=(r-o)*.1;return o-=n,r+=n,{min:o,max:r}}function $r(e,t,o){let r=e.filter(n=>n.unit==="C").map(n=>Rt(t,n.index,o));return jr(r)}function Oo(e,t,o,r,n,c){e.innerHTML="",e.setAttribute("viewBox",`0 0 ${je} ${Pt}`),e.setAttribute("preserveAspectRatio","xMidYMid meet");let s=o.map(g=>Rt(r,g.index,n));if(!s.some(g=>g.length))return e.appendChild($("text",{x:je/2,y:Pt/2,"text-anchor":"middle",class:"chart-empty"},"Collecting history\u2026")),null;let m=$r(o,r,n),l=Math.max(.001,m.max-m.min),p=g=>ye+(1-(g-m.min)/l)*ke,u=g=>ye+(1-Math.max(0,Math.min(100,g))/100)*ke,w=(g,_)=>g.unit==="%"?u(_):p(_);for(let g=0;g<3;g++){let _=g/2,d=ye+_*ke;e.appendChild($("line",{x1:Le,y1:d,x2:Le+mt,y2:d,class:"chart-grid"})),o.some(S=>S.unit==="C")&&e.appendChild($("text",{x:Le-6,y:d+4,"text-anchor":"end",class:"chart-tick"},Po(m.max-l*_,"C")+"\xB0")),o.some(S=>S.unit==="%")&&e.appendChild($("text",{x:Le+mt+6,y:d+4,"text-anchor":"start",class:"chart-tick"},Po(100-100*_,"%")))}e.appendChild($("line",{x1:Le,y1:Me,x2:Le+mt,y2:Me,class:"chart-axis"})),o.some(g=>g.unit==="C")&&e.appendChild($("text",{x:9,y:ye+ke/2,transform:`rotate(-90 9 ${(ye+ke/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},v("overview.graph.axis.temp"))),o.some(g=>g.unit==="%")&&e.appendChild($("text",{x:je-9,y:ye+ke/2,transform:`rotate(90 ${je-9} ${(ye+ke/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},v("overview.graph.axis.demand"))),Zr(e,n,c),o.forEach((g,_)=>{let d=s[_].map(L=>({x:gt(L.t,n),y:w(g,L.v)}));if(!d.length)return;let S=qe(d);g.fill&&e.appendChild($("path",{d:S+` L ${d[d.length-1].x.toFixed(1)} ${Me} L ${d[0].x.toFixed(1)} ${Me} Z`,fill:g.fill,stroke:"none"})),e.appendChild($("path",{d:S,fill:"none",stroke:g.color,"stroke-width":String(g.width||2.2),"stroke-linecap":"round","stroke-linejoin":"round"}))});let y=[];for(let g=0;g<r.length;g++){let _=r[g];if(!_||_[0]<n)continue;let d=o.map(S=>_[S.index]);d.every(S=>S==null||!Number.isFinite(S))||y.push({t:_[0],vals:d})}if(!y.length)return null;let f=Date.now();return dt(e,t,{count:y.length,plotTop:ye,plotBottom:Me,xAt:g=>gt(y[g].t,n),label:g=>new Date(f-(c-y[g].t)*1e3).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),dots:g=>o.map((_,d)=>({y:w(_,y[g].vals[d]),color:_.color})).filter((_,d)=>Number.isFinite(y[g].vals[d])),rows:g=>o.map((_,d)=>({color:_.color,label:_.label,value:Wr(y[g].vals[d],_.unit)})).filter((_,d)=>Number.isFinite(y[g].vals[d]))})}function ut(e,t,o){let r=Rt(e,t,o);return r.length?r[r.length-1].v:null}var Os=P({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:Br,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),n=t.querySelector(".gw-flow"),c=t.querySelector(".gw-demand"),s=Array.from(t.querySelectorAll(".gw-toggle")),m={flow:!0,return:!0,demand:!0},l=null,p=null;function u(){s.forEach(f=>{let g=f.dataset.layer;f.classList.toggle("is-off",!m[g]),f.setAttribute("aria-pressed",m[g]?"true":"false")})}function w(){let f=[];return m.flow&&f.push({index:Ao,color:Hr,label:v("overview.graph.layers.flow"),unit:"C",width:2.4}),m.return&&f.push({index:Mo,color:qr,label:v("overview.graph.layers.return"),unit:"C",width:2}),m.demand&&f.push({index:pt,color:No,label:v("overview.graph.layers.demand"),unit:"%",width:1.8,fill:"rgba(255,193,77,.10)"}),f}function y(){let f=Z("zoneStateHistory"),g=f&&Array.isArray(f.entries)?f.entries:[],_=f&&f.uptime_s||Number(Date.now()/1e3)|0,d=_-Ot;if(n){l&&l();let S=ut(g,Ao,d),L=ut(g,Mo,d),h=ut(g,pt,d),b=[];S!=null&&L!=null&&b.push("\u0394 "+(S-L).toFixed(1)+"\xB0"),h!=null&&b.push(Math.round(h)+"%"),o.textContent=b.length?b.join(" \xB7 "):"\u2014",l=Oo(n,n.closest(".chart-card"),w(),g,d,_)}if(c){p&&p();let S=ut(g,pt,d);r.textContent=S!=null?Math.round(S)+"%":"\u2014",p=Oo(c,c.closest(".chart-card"),[{index:pt,color:No,label:v("overview.graph.layers.demand"),unit:"%",width:2.2,fill:"var(--series-cool-fill)"}],g,d,_)}}s.forEach(f=>{f.addEventListener("click",()=>{let g=f.dataset.layer;m[g]=!m[g],!m.flow&&!m.return&&!m.demand&&(m[g]=!0),u(),y()})}),I("zoneStateHistory",y),E(t),u(),y()}});var Vr=.5;function Gr(e){let t=String(e||"").toUpperCase(),o=0;return t.includes("N")&&(o|=1),t.includes("E")&&(o|=2),t.includes("S")&&(o|=4),t.includes("W")&&(o|=8),o}function Ur(e,t){let o=[[1,0],[2,90],[4,180],[8,270]],r=0;for(let[n,c]of o){if(!(e&n))continue;let s=(Number(t)-c)*Math.PI/180;r=Math.max(r,Math.cos(s))}return Math.max(0,r)}function Xr(e,t){let o=Gr(D(i.exteriorWalls(t)));if(!o)return 0;let r=Number(k(i.windExposure(t))),n=Number(k(i.solarGain(t))),c=Number.isFinite(r)?r:.5,s=Number.isFinite(n)?n:.3,m=Ur(o,e[2]),l=c*m*(Number(e[1])/10),p=Math.max(0,21-Number(e[0]))/10,u=s*(Math.max(0,Number(e[3])||0)/800);return Math.max(0,l*p-u)}function Ro(e,t){let o=Math.min(t||(e?e.length:0),e?e.length:0),r=Number(k(a.forecastLoadThreshold)),n=Number(k(a.forecastMaxOffsetC)),c=Number.isFinite(r)?r:1,s=Number.isFinite(n)?n:1.5,m=[];for(let l=1;l<=6;l++){let p=Number(k(i.thermalLeadH(l))),u=Math.max(0,Math.min(24,Number.isFinite(p)?Math.round(p):4)),w=[];for(let y=0;y<o;y++){let f=Math.min(o-1,y+u),g=0;for(let d=y;d<=f;d++)g=Math.max(g,Xr(e[d],l));let _=g-c;w.push(_>0?Math.min(s,_*Vr):0)}m.push({zone:l,offsets:w})}return m}function Ho(e,t){e(a.forecastLoadThreshold,t),e(a.forecastMaxOffsetC,t);for(let o=1;o<=6;o++)e(i.exteriorWalls(o),t),e(i.windExposure(o),t),e(i.solarGain(o),t),e(i.thermalLeadH(o),t)}var we={0:{labelKey:"state.off",color:"#2c4875"},1:{labelKey:"state.manual",color:"#d07bb5"},2:{labelKey:"state.calibrating",color:"#ffd380"},3:{labelKey:"state.waitCal",color:"#6B5C84"},4:{labelKey:"state.waitTemp",color:"#6B5C84"},5:{labelKey:"state.heating",color:"#ff8531"},6:{labelKey:"state.idle",color:"#39354c"},7:{labelKey:"state.overheated",color:"#ff6361"},255:{labelKey:"",color:"transparent"}},Ve=24*3600,ft=12*3600,Yr=Ve+ft,Ne=18,Wt=4,Ce=54,Ge=32,Fe=4,bt=10,Bo=6,Wo="#bc5090",Zo="#38b2ff",Kr=.5,Ht=9,qt=6,It=2,qo=se+1,jo=Fe+se*(Ne+Wt)-Wt,Bt=jo+Bo,$e=jo+Bo+bt+Ge,Jr=`
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
`;T("zone-state-timeline",Jr);var Qr=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span data-i18n="overview.timeline.title">Zone State</span>
      <strong>-24 h / +12 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function ea(e,t,o){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,n=e.uptime_s||t||0,c=Number(Date.now()/1e3)|0,s=1e3,m=s-Ce;function l(F){let A=(F+Ve)/Yr;return Ce+Math.max(0,Math.min(1,A))*m}function p(F){return F-n}let u="http://www.w3.org/2000/svg",w=document.createElementNS(u,"svg");w.setAttribute("viewBox","0 0 "+s+" "+$e),w.classList.add("timeline-svg");let y=document.createElementNS(u,"rect");y.setAttribute("x",Ce),y.setAttribute("y",Fe),y.setAttribute("width",m),y.setAttribute("height",$e-Fe-Ge),y.setAttribute("fill","rgba(0,32,46,0.55)"),y.setAttribute("rx","4"),w.appendChild(y);let f=l(0),g=document.createElementNS(u,"rect");g.setAttribute("x",f),g.setAttribute("y",Fe),g.setAttribute("width",Ce+m-f),g.setAttribute("height",$e-Fe-Ge),g.setAttribute("fill","rgba(255,166,0,0.035)"),w.appendChild(g);let _=[-24,-18,-12,-6,0,6,12].map(F=>F*3600);for(let F of _){let A=l(F),M=document.createElementNS(u,"line");M.setAttribute("x1",A),M.setAttribute("y1",Fe),M.setAttribute("x2",A),M.setAttribute("y2",$e-Ge),M.setAttribute("stroke",F===0?"var(--series-solar)":"rgba(120,146,200,.16)"),M.setAttribute("stroke-width","1"),F===0&&(M.setAttribute("stroke-dasharray","2 3"),M.setAttribute("opacity",".55"),M.setAttribute("vector-effect","non-scaling-stroke")),w.appendChild(M)}w.appendChild(ta(u,"text",{x:f+4,y:Fe+11,"text-anchor":"start",fill:"rgba(255,211,128,.92)","font-size":"9","font-family":"Montserrat, sans-serif","font-weight":"600"},"now"));let d=(()=>{let F=o&&Array.isArray(o.hours)?o.hours:[];return!F.length||!o.base_epoch?[]:Ro(F,o.count||F.length)})(),S=d.reduce((F,A)=>{for(let M of A.offsets)F=Math.max(F,Number(M)||0);return F},0);function L(F){if(!K(i.enabled(F))||!K(a.drivers))return 0;let A=String(D(i.state(F))||"").toUpperCase();return A==="MANUAL"?1:A==="CALIBRATING"?2:A==="WAITING_CALIBRATION"?3:A==="WAITING_ROOM_TEMP"||A==="UNKNOWN"?4:A==="HEATING"?5:A==="IDLE"?6:A==="OVERHEATED"?7:6}function h(F,A){let M=L(F);if(M<=4||M===7)return M;let j=Number(k(i.temp(F))),Y=Number(k(i.setpoint(F)));if(!Number.isFinite(j)||!Number.isFinite(Y))return 4;let ae=Number(k(i.preheatAdvance(F))),U=Number.isFinite(ae)?Math.max(0,ae):0,oe=Y+Math.max(0,Number(A)||0)-Kr+U;return j<oe?5:6}for(let F=0;F<se;F++){let A=Fe+F*(Ne+Wt),M=document.createElementNS(u,"rect");M.setAttribute("x",Ce),M.setAttribute("y",A),M.setAttribute("width",m),M.setAttribute("height",Ne),M.setAttribute("fill",F%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),w.appendChild(M);let j=document.createElementNS(u,"text");j.setAttribute("x",Ce-4),j.setAttribute("y",A+Ne/2+1),j.setAttribute("text-anchor","end"),j.setAttribute("dominant-baseline","middle"),j.setAttribute("fill","rgba(233,222,210,.62)"),j.setAttribute("font-size","9.5"),j.setAttribute("font-family","Montserrat, sans-serif"),j.setAttribute("font-weight","600"),j.textContent="Z"+(F+1),w.appendChild(j);let Y=r.map(te=>({rel:p(te[0]),state:te[F+1]})).filter(te=>te.rel>=-Ve&&te.rel<=0),ae=(te,oe,ee)=>{if(ee===255)return;let X=we[ee]||we[255];if(X.color==="transparent")return;let xe=l(te),de=l(oe),pe=Math.max(1,de-xe),be=document.createElementNS(u,"rect");be.setAttribute("x",xe),be.setAttribute("y",A+(Ne-Ht)/2),be.setAttribute("width",pe),be.setAttribute("height",Ht),be.setAttribute("fill",X.color),be.setAttribute("rx",String(Ht/2)),be.setAttribute("opacity","0.9"),w.appendChild(be)};if(Y.length){let te=Y[0].rel,oe=Y[0].state;for(let ee=1;ee<Y.length;ee++){let X=Y[ee];X.state!==oe&&(ae(te,X.rel,oe),te=X.rel,oe=X.state)}ae(te,0,oe)}let U=d[F];if(U&&o&&o.base_epoch){let te=[],oe=[];for(let ee=0;ee<U.offsets.length;ee++){let X=Number(U.offsets[ee])||0,xe=o.base_epoch+ee*3600-c,de=xe+3600;if(de<=0||xe>=ft)continue;let pe=Math.max(0,xe),be=Math.min(ft,de),Vt=h(F+1,X),Ue=te[te.length-1];if(Ue&&Ue.state===Vt&&Math.abs(Ue.end-pe)<2?Ue.end=be:te.push({start:pe,end:be,state:Vt}),X>0&&S>0){let Ie=oe[oe.length-1];Ie&&Math.abs(Ie.end-pe)<2?(Ie.end=be,Ie.peak=Math.max(Ie.peak,X)):oe.push({start:pe,end:be,peak:X})}}for(let ee of te){let X=we[ee.state]||we[255];if(!X||X.color==="transparent")continue;let xe=l(ee.start),de=l(ee.end),pe=document.createElementNS(u,"rect");pe.setAttribute("x",xe),pe.setAttribute("y",A+(Ne-qt)/2),pe.setAttribute("width",Math.max(1,de-xe)),pe.setAttribute("height",qt),pe.setAttribute("fill",X.color),pe.setAttribute("rx",String(qt/2)),pe.setAttribute("opacity",ee.state===5?"0.50":"0.34"),w.appendChild(pe)}for(let ee of oe){let X=l(ee.start),xe=l(ee.end),de=document.createElementNS(u,"rect");de.setAttribute("x",X+1),de.setAttribute("y",A+Ne-It-2),de.setAttribute("width",Math.max(1,xe-X-2)),de.setAttribute("height",String(It)),de.setAttribute("fill",Zo),de.setAttribute("rx",String(It/2)),de.setAttribute("opacity",String(Math.min(.82,.26+ee.peak/S*.48))),w.appendChild(de)}}}{let F=document.createElementNS(u,"rect");F.setAttribute("x",Ce),F.setAttribute("y",Bt),F.setAttribute("width",m),F.setAttribute("height",bt),F.setAttribute("fill","rgba(188,80,144,0.10)"),F.setAttribute("rx","2"),w.appendChild(F);let A=document.createElementNS(u,"text");A.setAttribute("x",Ce-4),A.setAttribute("y",Bt+bt/2+1),A.setAttribute("text-anchor","end"),A.setAttribute("dominant-baseline","middle"),A.setAttribute("fill","rgba(233,222,210,.62)"),A.setAttribute("font-size","8.5"),A.setAttribute("font-family","Montserrat, sans-serif"),A.setAttribute("font-weight","600"),A.textContent=v("overview.timeline.absorb"),w.appendChild(A);let M=r.map(j=>({rel:p(j[0]),on:j.length>qo?j[qo]:0})).filter(j=>j.rel>=-Ve&&j.rel<=0);if(M.length){let j=(U,te)=>{let oe=l(U),ee=Math.max(1,l(te)-oe),X=document.createElementNS(u,"rect");X.setAttribute("x",oe),X.setAttribute("y",Bt),X.setAttribute("width",ee),X.setAttribute("height",bt),X.setAttribute("fill",Wo),X.setAttribute("rx","2"),X.setAttribute("opacity","0.9"),w.appendChild(X)},Y=M[0].rel,ae=M[0].on;for(let U=1;U<M.length;U++)M[U].on!==ae&&(ae&&j(Y,M[U].rel),Y=M[U].rel,ae=M[U].on);ae&&j(Y,0)}}let b=$e-Ge+15,C=3600,N=Math.ceil((c-Ve)/C)*C,R=Math.floor((c+ft)/C)*C,q=Math.floor(c/C)*C;for(let F=N;F<=R;F+=C){let A=F-c,M=l(A),j=new Date(F*1e3),Y=String(j.getHours()).padStart(2,"0"),ae=F===q,U=document.createElementNS(u,"text");U.setAttribute("x",M),U.setAttribute("y",b),U.setAttribute("text-anchor","end"),U.setAttribute("fill",ae?"rgba(255,211,128,.95)":"rgba(202,219,248,.72)"),U.setAttribute("font-size","9"),U.setAttribute("font-family",'"Montserrat", sans-serif'),U.setAttribute("font-weight","500"),U.setAttribute("font-variant-numeric","tabular-nums lining-nums"),U.setAttribute("font-feature-settings",'"tnum" 1, "lnum" 1'),U.setAttribute("letter-spacing","0"),U.setAttribute("transform",`rotate(-45 ${M.toFixed(1)} ${b})`),U.textContent=Y,w.appendChild(U)}return w}function ta(e,t,o,r){let n=document.createElementNS(e,t);for(let c in o)n.setAttribute(c,o[c]);return r!=null&&(n.textContent=r),n}function Io(e){e.innerHTML="";let t=[{code:5,...we[5]},{code:6,...we[6]},{code:0,...we[0]},{code:1,...we[1]},{code:7,...we[7]},{code:2,...we[2]}];for(let c of t){let s=document.createElement("div");s.className="tl-legend-item",s.innerHTML='<span class="tl-legend-dot" style="background:'+c.color+'"></span>'+(c.labelKey?v(c.labelKey):""),e.appendChild(s)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+Wo+'"></span>'+v("overview.timeline.preheatAbsorption"),e.appendChild(o);let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot expected" style="background:'+we[5].color+'"></span>'+v("overview.timeline.expectedState"),e.appendChild(r);let n=document.createElement("div");n.className="tl-legend-item",n.innerHTML='<span class="tl-legend-dot" style="background:'+Zo+'"></span>'+v("overview.timeline.weatherPreload"),e.appendChild(n)}var Gs=P({tag:"zone-state-timeline",render:Qr,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");Io(r);function n(){let c=Z("zoneStateHistory"),s=et(),m=(()=>{let p=Z&&Z("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!c||!c.entries||c.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent=v("overview.timeline.noHistory"),o.appendChild(p);return}let l=ea(c,m,s);l&&o.appendChild(l)}I("zoneStateHistory",n),I("zoneNames",n),I("forecastHours",n),Ho(z,n),z(a.drivers,n);for(let c=1;c<=se;c++)z(i.enabled(c),n),z(i.state(c),n),z(i.temp(c),n),z(i.setpoint(c),n),z(i.preheatAdvance(c),n);E(t),n()}});var oa=`
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
`;T("zone-grid",oa);var ra=()=>'<div class="zone-grid"></div>',Ks=P({tag:"zone-grid",render:ra,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(V("zone-card",{zone:o}))}});var aa=`
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
	background: rgba(28,58,103,.50);
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
.zone-card.zs-idle { border-left-color: #8a508f; }
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
`;T("zone-card",aa);var na=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span><span class="zc-link" hidden>LINK</span></div>
		<div class="zc-zone-name">${J(e.zone)}</div>
		<div class="zc-friendly">${_e(e.zone)||"---"}</div>
	</div>
`,ni=P({tag:"zone-card",state:e=>({zone:e.zone}),render:na,onMount(e,t){let o=e.zone,r=i.temp(o),n=i.state(o),c=i.enabled(o),s=t.querySelector(".zc-state-label"),m=t.querySelector(".zc-dot"),l=t.querySelector(".zc-link"),p=t.querySelector(".zc-zone-name"),u=t.querySelector(".zc-friendly");function w(f){let g=String(f||"").match(/\d+/);return g?Number(g[0]):0}function y(){let f=K(c),g=String(D(n)||"").toUpperCase()||"OFF",_=String(D(i.motorLastFault(o))||"").toUpperCase(),d=_&&_!=="NONE"&&_!=="OK",S=f&&(g==="FAULT"||d)?"FAULT":g,L=Z("selectedZone")===o,h=_e(o);p.textContent=J(o),u.textContent=h||fe(k(r));let b=f?S:"OFF";s.textContent=b==="HEATING"?v("state.heating"):b==="IDLE"?v("state.idle"):b==="FAULT"?v("common.fault"):b==="MANUAL"?v("state.manual"):b==="OVERHEATED"?v("state.overheated"):b==="CALIBRATING"?v("state.calibrating"):v("state.off");let C=w(D(i.syncTo(o))),N=[];for(let M=1;M<=6;M++)M!==o&&w(D(i.syncTo(M)))===o&&N.push(M);let R=C>0&&C!==o||N.length>0;l.hidden=!R,l.textContent=C>0&&C!==o?v("zone.card.linkZone",{zone:C}):N.length>1?v("zone.card.groupCount",{count:N.length}):v("zone.card.linkZone",{zone:N[0]});let q=C>0&&C!==o?v("zone.card.groupedWith",{zones:J(C)}):N.length>0?v("zone.card.groupedWith",{zones:N.map(J).join(", ")}):"";t.title=d?v("zone.card.fault",{fault:_}):q;let F=b==="HEATING"?"#ffd380":b==="IDLE"?"#79d17e":b==="FAULT"?"#ff6361":"#6E7E96",A=b==="HEATING"?"#ff8531":b==="IDLE"?"#79d17e":b==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";s.style.color=F,m.style.background=A,m.style.boxShadow=b==="HEATING"?"0 0 5px rgba(255,133,49,.6)":b==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",L),t.classList.toggle("disabled",!f),t.classList.toggle("zs-heating",f&&b==="HEATING"),t.classList.toggle("zs-fault",f&&b==="FAULT"),t.classList.toggle("zs-idle",f&&b!=="HEATING"&&b!=="FAULT"),t.classList.toggle("zs-off",!f)}t.addEventListener("click",()=>{Yt(o)}),z(r,y),z(n,y),z(c,y),z(i.motorLastFault(o),y);for(let f=1;f<=6;f++)z(i.syncTo(f),y);I("selectedZone",y),I("zoneNames",y),y()}});var sa=`
.zone-detail {
  background: rgba(0,63,92,.30);
  border: 1px solid rgba(120,146,200,.30);
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
`;T("zone-detail",sa);var ia=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${J(e.zone)}</div>
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
`;function $o(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Vo(e){return e!=null?Number(e).toFixed(0):"---"}function la(e){return e!=null?Number(e).toFixed(2)+"C":"---"}function ca(e,t){if(!t)return v("common.disabled");let o=String(e||"IDLE").toUpperCase();return o==="HEATING"?v("state.heating"):o==="IDLE"?v("state.idle"):o==="OFF"?v("state.off"):o==="FAULT"?v("common.fault"):o==="MANUAL"?v("state.manual"):o==="OVERHEATED"?v("state.overheated"):o==="CALIBRATING"?v("state.calibrating"):o}var gi=P({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:ia,methods:{update(e,t){let o=Z("selectedZone"),r=String(D(i.state(o))||"").toUpperCase(),n=K(i.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=J(o),t.setpoint.textContent=fe(k(i.setpoint(o))),t.temp.textContent=fe(k(i.temp(o))),t.ret.textContent=fe(k("sensor-manifold_return_temperature")),t.valve.textContent=lt(k(i.valve(o)));let c=t.badge;c.textContent=ca(r,n);let s=n?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";c.className="zd-badge"+(s?" "+s:""),t.toggle.classList.toggle("on",n),t.orip.textContent=Vo(k(i.motorOpenRipples(o))),t.crip.textContent=Vo(k(i.motorCloseRipples(o))),t.ofac.textContent=$o(k(i.motorOpenFactor(o))),t.cfac.textContent=$o(k(i.motorCloseFactor(o))),t.ph.textContent=la(k(i.preheatAdvance(o)));let m=String(D(i.motorLastFault(o))||"").toUpperCase(),l=m&&m!=="NONE"&&m!=="OK";t.fault.hidden=!l,l&&(t.faultVal.textContent=m)},incSetpoint(){let e=this.zone,t=k(i.setpoint(e))||20;Ct(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=k(i.setpoint(e))||20;Ct(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=K(i.enabled(e));io(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),n=c=>{let s=Z("selectedZone");(c===i.temp(s)||c===i.setpoint(s)||c===i.valve(s)||c===i.state(s)||c===i.enabled(s))&&r()};for(let c=1;c<=6;c++)z(i.temp(c),n),z(i.setpoint(c),n),z(i.valve(c),n),z(i.state(c),n),z(i.enabled(c),n),z(i.motorOpenRipples(c),r),z(i.motorCloseRipples(c),r),z(i.motorOpenFactor(c),r),z(i.motorCloseFactor(c),r),z(i.preheatAdvance(c),r),z(i.motorLastFault(c),r);z("sensor-manifold_return_temperature",r),I("selectedZone",r),E(t),r()}});var da=`
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
  background: rgba(0,32,46,.34);
}
.zone-sensor-card .merge-pill.secondary {
  border-color: rgba(138,80,143,.42);
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
`;T("zone-sensor-card",da);var pa=()=>{let e='<option value="None" data-i18n="common.none">None</option>';for(let t=1;t<=8;t++)e+='<option value="Probe '+t+'">Probe '+t+"</option>";return`
    <div class="ui-card zone-sensor-card">
      <div class="ui-card-title" data-i18n="zone.sensor.title">Temperature Sensors / Connectivity</div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="zone.sensor.returnSensor">Zone Return Temperature Sensor</span>
        <span class="ui-field"><select class="ui-select zs-probe">${e}</select></span>
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
  `};function Go(e,t){let o=e.value,r='<option value="None" data-i18n="common.none">'+v("common.none")+"</option>";for(let n=1;n<=6;n++)n!==t&&(r+='<option value="Zone '+n+'">'+v("common.zone")+" "+n+"</option>");e.innerHTML=r,e.value=o||"None"}function ua(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function ma(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function Uo(e,t){let o='<option value="Local Probe" data-i18n="zone.sensor.localProbe">'+v("zone.sensor.localProbe")+'</option><option value="BLE Sensor" data-i18n="zone.sensor.bleSource">'+v("zone.sensor.bleSource")+"</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}function Xo(e){let t=String(e||"").match(/\d+/);return t?Number(t[0]):0}var Si=P({tag:"zone-sensor-card",render:pa,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),n=t.querySelector(".zs-ble"),c=t.querySelector(".zs-sync"),s=t.querySelector(".zs-row-ble"),m=t.querySelector(".zs-scan"),l=t.querySelector(".zs-scan-list"),p=t.querySelector(".merge-visual"),u=t.querySelector(".merge-rail"),w=t.querySelector(".merge-caption"),y=0;function f(){return Z("selectedZone")}function g(){s.style.display=r.value==="BLE Sensor"?"":"none"}function _(){let b=f(),C=Xo(c.value),N=[];for(let A=1;A<=6;A++)A!==b&&Xo(D(i.syncTo(A)))===b&&N.push(A);let R=C>0&&C!==b,q=R||N.length>0;if(p.classList.toggle("is-solo",!q),!q){u.innerHTML='<span class="merge-pill primary">'+J(b)+'</span><span class="merge-link"></span><span class="merge-pill">'+v("zone.sensor.noMerge")+"</span>",w.textContent=v("zone.sensor.soloCaption");return}if(R){u.innerHTML='<span class="merge-pill secondary">'+J(b)+'</span><span class="merge-link"></span><span class="merge-pill primary">'+J(C)+"</span>",w.textContent=v("zone.sensor.followsCaption",{zone:J(b),target:J(C)});return}let F='<span class="merge-pill primary">'+J(b)+"</span>";for(let A of N)F+='<span class="merge-link"></span><span class="merge-pill secondary">'+J(A)+"</span>";u.innerHTML=F,w.textContent=v("zone.sensor.primaryCaption",{zone:J(b),zones:N.map(J).join(", ")})}let d=ce(t);Uo(r,"Local Probe"),d.select(o,{read:()=>D(i.probe(f()))||void 0,commit:b=>Re(f(),"zone_probe",b)}),d.select(r,{read:()=>ua(String(D(i.tempSource(f()))||"")),commit:b=>Re(f(),"zone_temp_source",ma(b))}),d.select(c,{read:()=>D(i.syncTo(f()))||"None",commit:b=>Re(f(),"zone_sync_to",b)});let S=d.text(n,{read:()=>D(i.ble(f()))||"",commit:b=>We(f(),"zone_ble_mac",b)});r.addEventListener("change",g),c.addEventListener("change",_);function L(){let b=f();y!==b?(Go(c,b),y=b,l.style.display="none",d.discard()):d.refresh(),g(),_()}function h(b){let C=f();(b===i.probe(C)||b===i.tempSource(C)||b===i.syncTo(C)||b===i.ble(C)||/^select-zone_\d+_sync_to$/.test(b))&&(d.refresh(),g(),_())}m.addEventListener("click",()=>{if(m.disabled)return;m.disabled=!0,m.textContent="\u2026",l.style.display="",l.innerHTML='<div class="scan-msg">'+v("zone.sensor.scanning")+"</div>";let b=new AbortController,C=setTimeout(()=>b.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:b.signal}).then(N=>{if(!N.ok)throw new Error("HTTP "+N.status);return N.json()}).then(N=>{if(clearTimeout(C),m.disabled=!1,m.textContent=v("zone.sensor.scan"),!N.ok||!N.sensors||N.sensors.length===0){l.innerHTML='<div class="scan-msg">'+v("zone.sensor.noSensors")+"</div>";return}let R=f(),q=(D(i.ble(R))||"").toUpperCase(),F=M=>String(M).replace(/[&<>"']/g,j=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[j]),A="";for(let M of N.sensors){let j=M.mac.toUpperCase(),Y=M.name?F(M.name):"",ae=M.temp_c!=null?M.temp_c.toFixed(1)+"\xB0C":"\u2014",U=M.rssi!=null?M.rssi+" dBm":"",te=M.age_s<60?v("common.secondsAgo",{value:M.age_s}):v("common.minutesAgo",{value:Math.round(M.age_s/60)}),oe="";j===q?oe='<span class="ble-badge">'+v("zone.sensor.assignedThisZone")+"</span>":M.zone>0&&(oe='<span class="ble-badge">'+v("zone.sensor.zoneBadge",{zone:M.zone})+"</span>");let ee=Y?`<div class="ble-mac">${Y}</div><div class="ble-meta">${j}</div>`:`<div class="ble-mac">${j}</div>`;A+=`<div class="ble-scan-item">
              <div>
                ${ee}
                <div class="ble-meta">${ae} &nbsp;${U} &nbsp;${te}</div>
                ${oe}
              </div>
              <button class="btn-assign" data-mac="${j}">${v("zone.sensor.assign")}</button>
            </div>`}l.innerHTML=A,l.querySelectorAll(".btn-assign").forEach(M=>{M.addEventListener("click",()=>{n.value=M.dataset.mac,S.markDirty(),l.style.display="none"})})}).catch(N=>{clearTimeout(C),m.disabled=!1,m.textContent=v("zone.sensor.scan");let R=N&&N.name==="AbortError"?v("zone.sensor.scanTimeout"):v("zone.sensor.scanFailed");l.innerHTML='<div class="scan-msg">'+R+"</div>"})}),I("selectedZone",L);for(let b=1;b<=6;b++)z(i.probe(b),h),z(i.tempSource(b),h),z(i.syncTo(b),h),z(i.ble(b),h);E(t),L()}});var ga=[0,.5,.7,.85,1];function fa(e){return ga[Math.min(e,4)]}var ba=`
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
`;T("zone-room-card",ba);var ha=()=>`
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
`,Ni=P({tag:"zone-room-card",render:ha,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),n=t.querySelector(".zr-spacing"),c=t.querySelector(".zr-pipe"),s=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),m=t.querySelector(".zr-wind"),l=t.querySelector(".zr-solar"),p=t.querySelector(".zr-lead");function u(){return Z("selectedZone")}let w=ce(t);w.text(o,{read:()=>_e(u())||"",commit:S=>po(u(),S)}),w.num(r,{read:()=>k(i.area(u())),commit:S=>He(u(),"zone_area_m2",S)}),w.num(n,{read:()=>k(i.spacing(u())),commit:S=>He(u(),"zone_pipe_spacing_mm",S||200)}),w.select(c,{read:()=>D(i.pipeType(u()))||"Unknown",commit:S=>Re(u(),"zone_pipe_type",S)});let y=w.num(m,{read:()=>k(i.windExposure(u())),commit:S=>He(u(),"zone_wind_exposure",S)});w.num(l,{read:()=>k(i.solarGain(u())),commit:S=>He(u(),"zone_solar_gain",S)}),w.num(p,{read:()=>k(i.thermalLeadH(u())),commit:S=>He(u(),"zone_thermal_lead_h",S)});let f=[];function g(){s.forEach(S=>{let L=S.dataset.wall;S.classList.toggle("active",L==="None"?f.length===0:f.includes(L))})}let _=w.custom({sync:()=>{let S=D(i.exteriorWalls(u()))||"None";f=S==="None"?[]:S.split(",").filter(Boolean),g()},commit:()=>We(u(),"zone_exterior_walls",f.length?f.join(","):"None")});s.forEach(S=>{S.addEventListener("click",()=>{let L=S.dataset.wall,h=f.slice();if(L==="None")h=[];else{let b=h.indexOf(L);b>=0?h.splice(b,1):h.push(L)}f=["N","S","E","W"].filter(b=>h.includes(b)),g(),_.markDirty(),m.value=String(fa(f.length)),y.markDirty()})});function d(S){let L=u();(S===i.area(L)||S===i.spacing(L)||S===i.pipeType(L)||S===i.exteriorWalls(L)||S===i.windExposure(L)||S===i.solarGain(L)||S===i.thermalLeadH(L))&&w.refresh()}I("selectedZone",w.discard),I("zoneNames",w.refresh);for(let S=1;S<=6;S++)z(i.area(S),d),z(i.spacing(S),d),z(i.pipeType(S),d),z(i.exteriorWalls(S),d),z(i.windExposure(S),d),z(i.solarGain(S),d),z(i.thermalLeadH(S),d);E(t),w.refresh()}});var ze=6,va="#6E7E96",Jo="#5C6B85",xa="#8a508f",ya="#BC5090",wa="#FF8531",za="#FFA600",Sa="#8a508f",_a="#FFEAD2",ka="#6E7E96",Yo="#C7B6CE",ht="#5C6B85",Zt="#A38FB0",Qo="#9A86A8",Ko="#8a508f",La="#66BB6A",Ca="#FF6361",G={w:1160,h:310,boxX:452,boxY:34,boxW:256,boxH:68,topBarY:0,topBarH:24,srcY:102,fanY:158,zoneY:232,zoneXs:[92,286,480,674,868,1062],srcSpread:15,bgDstHW:28,srcHW:7},H={w:760,h:340,boxX:38,boxY:132,boxW:142,boxH:72,srcX:180,endX:386,nameX:446,midY:168,zoneYs:[58,104,150,196,242,288],spread:8,bgDstHW:15,srcHW:4},Fa=`
.flow-wrap {
  width: 100%;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--panel-border);
  box-shadow: var(--panel-shadow);
  background: #042a3b;
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
`;T("flow-diagram",Fa);function Ea(e,t){let o=String(_e(e)||"").trim();if(!o)return"";let r=o.toUpperCase();return r.length>t?r.slice(0,Math.max(1,t-1))+"\u2026":r}function Aa(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Ma(e,t){return t?e==null||Number.isNaN(e)?Jo:e<.15?xa:e<.4?ya:e<.7?wa:za:va}function er(e){let t=e==="desktop"?"0 1":"1 0",o=[];o.push("<defs>"),o.push('<pattern id="'+e+'-fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="'+e+'-fglow" cx="32%" cy="18%" r="78%"><stop offset="0%" stop-color="rgba(122,167,206,0.18)"/><stop offset="52%" stop-color="rgba(240,121,91,0.08)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="'+e+'-boxgrad" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(let r=1;r<=ze;r++)o.push('<linearGradient id="'+e+"-rg"+r+'" x1="0" y1="0" x2="'+t.split(" ")[0]+'" y2="'+t.split(" ")[1]+'">'),o.push('<stop id="'+e+"-rgs"+r+'" offset="0%" stop-color="#ff8531"/>'),o.push('<stop id="'+e+"-rga"+r+'" offset="100%" stop-color="#8a508f"/>'),o.push("</linearGradient>");return o.push("</defs>"),o.join("")}function vt(e,t,o){let r=G.boxX+G.boxW/2+(e-2.5)*G.srcSpread,n=G.srcY,c=G.zoneXs[e],s=G.zoneY-20,m=G.fanY,l=G.fanY+34;return"M"+(r-t).toFixed(1)+" "+n+" C"+(r-t).toFixed(1)+" "+m+" "+(c-o).toFixed(1)+" "+l+" "+(c-o).toFixed(1)+" "+s+" L"+(c+o).toFixed(1)+" "+s+" C"+(c+o).toFixed(1)+" "+l+" "+(r+t).toFixed(1)+" "+m+" "+(r+t).toFixed(1)+" "+n+"Z"}function xt(e,t,o){let r=H.midY+(e-2.5)*H.spread,n=H.zoneYs[e],c=H.endX-H.srcX,s=H.srcX+c*.34,m=H.srcX+c*.7;return"M"+H.srcX+" "+(r-t).toFixed(1)+" C"+s+" "+(r-t).toFixed(1)+" "+m+" "+(n-o).toFixed(1)+" "+H.endX+" "+(n-o).toFixed(1)+" L"+H.endX+" "+(n+o).toFixed(1)+" C"+m+" "+(n+o).toFixed(1)+" "+s+" "+(r+t).toFixed(1)+" "+H.srcX+" "+(r+t).toFixed(1)+"Z"}function tr(e,t,o){return'<rect width="'+e+'" height="'+t+'" rx="22" fill="#042a3b"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fdots)" opacity="0.48"/><rect width="'+e+'" height="'+t+'" rx="22" fill="url(#'+o+'-fglow)"/>'}function or(e){let t=e==="desktop"?G:H,o=e==="desktop"?t.boxY+27:t.boxY+29,r=e==="desktop"?t.boxY+56:t.boxY+58;return'<rect x="'+t.boxX+'" y="'+t.boxY+'" width="'+t.boxW+'" height="'+t.boxH+'" rx="7" fill="#ff8531"/><text id="'+e+'-fd-flow-label" x="'+(t.boxX+t.boxW/2)+'" y="'+o+'" text-anchor="middle" font-size="'+(e==="desktop"?18:17)+'" font-weight="800" fill="#00202e" letter-spacing="2">'+v("overview.flowDiagram.flow")+'</text><text id="'+e+'-fd-flow-temp" class="flow-metric" x="'+(t.boxX+t.boxW/2)+'" y="'+r+'" text-anchor="middle" font-size="'+(e==="desktop"?26:24)+'" fill="#00202e">---</text>'}function Na(){let e=[],t=G.w,o=G.h,r=G.zoneY-20;e.push('<svg class="flow-svg flow-svg-desktop" viewBox="0 5 '+t+" "+(o-5)+'" preserveAspectRatio="xMidYMid meet">'),e.push(er("desktop")),e.push(tr(t,o,"desktop")),e.push('<rect x="'+G.boxX+'" y="'+G.topBarY+'" width="'+G.boxW+'" height="'+G.topBarH+'" fill="url(#desktop-boxgrad)" rx="5"/>'),e.push(or("desktop")),e.push('<text id="desktop-fd-ret-temp" x="'+(G.boxX+G.boxW+24)+'" y="'+(G.boxY+20)+'" font-size="15" font-weight="800" fill="#8a508f" font-family="var(--mono)">'+v("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="desktop-fd-dt-label" x="'+(G.boxX+G.boxW+24)+'" y="'+(G.boxY+42)+'" font-size="12" font-weight="800" fill="'+Qo+'" letter-spacing="2">'+v("overview.flowDiagram.dt")+"</text>"),e.push('<text id="desktop-fd-dt" x="'+(G.boxX+G.boxW+24)+'" y="'+(G.boxY+65)+'" class="flow-metric" font-size="22" fill="#ff8531">---</text>');for(let n=1;n<=ze;n++)e.push('<path d="'+vt(n-1,G.srcHW,G.bgDstHW)+'" fill="#062a3a" opacity="0.86"/>');for(let n=1;n<=ze;n++)e.push('<path id="desktop-fd-path-'+n+'" class="flow-ribbon" d="'+vt(n-1,G.srcHW,G.bgDstHW)+'" fill="url(#desktop-rg'+n+')" opacity="1"/>');e.push('<line x1="54" y1="'+r+'" x2="'+(t-54)+'" y2="'+r+'" stroke="#ff8531" stroke-width="2" opacity=".42"/>');for(let n=1;n<=ze;n++){let c=G.zoneXs[n-1];e.push('<g class="flow-zone-hit">'),e.push('<line x1="'+c+'" y1="'+(r-8)+'" x2="'+c+'" y2="'+(r+8)+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="desktop-fd-zn'+n+'" x="'+c+'" y="'+(r-13)+'" text-anchor="middle" font-size="13" fill="#FFEAD2" font-weight="800" letter-spacing="1.8">Z'+n+"</text>"),e.push('<text id="desktop-fd-zf'+n+'" x="'+c+'" y="'+(r+20)+'" text-anchor="middle" font-size="9.5" fill="#B6A6C0" font-weight="700" letter-spacing=".8">---</text>'),e.push('<text id="desktop-fd-zsp'+n+'" x="'+c+'" y="'+(r+20)+'" text-anchor="middle" font-size="9" fill="'+ht+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="desktop-fd-zt'+n+'" x="'+c+'" y="'+(r+42)+'" text-anchor="middle" class="flow-metric" font-size="15" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="desktop-fd-zv'+n+'" x="'+(c-28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---%</text>'),e.push('<text id="desktop-fd-zr'+n+'" x="'+(c+28)+'" y="'+(r+61)+'" text-anchor="middle" class="flow-metric" font-size="13" fill="#C7B7D0">---</text>'),e.push("</g>")}return e.push("</svg>"),e.join("")}function Ta(){let e=[],t=H.w,o=H.h;e.push('<svg class="flow-svg flow-svg-mobile" viewBox="0 0 '+t+" "+o+'" preserveAspectRatio="xMidYMid meet">'),e.push(er("mobile")),e.push(tr(t,o,"mobile")),e.push('<rect x="0" y="'+H.boxY+'" width="'+(H.boxX-6)+'" height="'+H.boxH+'" fill="url(#mobile-boxgrad)" rx="4"/>'),e.push(or("mobile"));for(let r=1;r<=ze;r++)e.push('<path d="'+xt(r-1,H.srcHW,H.bgDstHW)+'" fill="#062a3a" opacity="0.86"/>');for(let r=1;r<=ze;r++)e.push('<path id="mobile-fd-path-'+r+'" class="flow-ribbon" d="'+xt(r-1,H.srcHW,H.bgDstHW)+'" fill="url(#mobile-rg'+r+')" opacity="1"/>');e.push('<rect x="'+(H.boxX+9)+'" y="'+(H.boxY+H.boxH+9)+'" width="'+(H.boxW-18)+'" height="60" rx="8" fill="rgba(4,42,59,.64)"/>'),e.push('<text id="mobile-fd-ret-temp" x="'+(H.boxX+H.boxW/2)+'" y="'+(H.boxY+H.boxH+27)+'" text-anchor="middle" font-size="12.5" font-weight="800" fill="#8a508f" font-family="var(--mono)">'+v("overview.flowDiagram.returnShort")+" ---</text>"),e.push('<text id="mobile-fd-dt-label" x="'+(H.boxX+H.boxW/2)+'" y="'+(H.boxY+H.boxH+43)+'" text-anchor="middle" font-size="9.5" font-weight="800" fill="'+Qo+'" letter-spacing="1.1">'+v("overview.flowDiagram.dt")+"</text>"),e.push('<text id="mobile-fd-dt" x="'+(H.boxX+H.boxW/2)+'" y="'+(H.boxY+H.boxH+63)+'" text-anchor="middle" class="flow-metric" font-size="19" fill="#ff8531">---</text>'),e.push('<line x1="'+H.endX+'" y1="34" x2="'+H.endX+'" y2="'+(o-34)+'" stroke="#ff8531" stroke-width="2" opacity=".48"/>'),e.push('<text id="mobile-fd-temp-head" x="506" y="30" font-size="10" fill="'+Zt+'" font-weight="700" letter-spacing="1.5">'+v("overview.graph.layers.temp").toUpperCase()+"</text>"),e.push('<text id="mobile-fd-flow-head" x="592" y="30" font-size="10" fill="'+Zt+'" font-weight="700" letter-spacing="1.5">'+v("overview.flowDiagram.flow")+"</text>"),e.push('<text id="mobile-fd-ret-head" x="678" y="30" font-size="10" fill="'+Zt+'" font-weight="700" letter-spacing="1.5">'+v("overview.flowDiagram.returnShort")+"</text>");for(let r=1;r<=ze;r++){let n=H.zoneYs[r-1];e.push('<line x1="'+(H.endX-8)+'" y1="'+n+'" x2="'+(H.endX+8)+'" y2="'+n+'" stroke="#ff8531" stroke-width="2" opacity=".5"/>'),e.push('<text id="mobile-fd-zn'+r+'" x="'+(H.endX-14)+'" y="'+(n+4)+'" text-anchor="end" font-size="12" fill="#FFEAD2" font-weight="800" letter-spacing="1.4">Z'+r+"</text>"),e.push('<text id="mobile-fd-zf'+r+'" x="'+H.nameX+'" y="'+(n-8)+'" text-anchor="middle" font-size="9" fill="#B6A6C0" font-weight="700" letter-spacing=".7">---</text>'),e.push('<text id="mobile-fd-zsp'+r+'" x="'+H.nameX+'" y="'+(n+7)+'" text-anchor="middle" font-size="8.5" fill="'+ht+'" font-weight="600" font-family="var(--mono)"></text>'),e.push('<text id="mobile-fd-zt'+r+'" x="506" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#F6ECE0">---\xB0C</text>'),e.push('<text id="mobile-fd-zv'+r+'" x="592" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#C7B7D0">---%</text>'),e.push('<text id="mobile-fd-zr'+r+'" x="678" y="'+(n+4)+'" class="flow-metric" font-size="13.5" fill="#C7B7D0">---</text>')}return e.push("</svg>"),e.join("")}var Da=()=>'<div class="flow-wrap">'+Na()+Ta()+"</div>";P({tag:"flow-diagram",render:Da,onMount(e,t){let o=["desktop","mobile"],r={};o.forEach(p=>{r[p]={flowEl:t.querySelector("#"+p+"-fd-flow-temp"),flowLabelEl:t.querySelector("#"+p+"-fd-flow-label"),retEl:t.querySelector("#"+p+"-fd-ret-temp"),dtLabelEl:t.querySelector("#"+p+"-fd-dt-label"),dtEl:t.querySelector("#"+p+"-fd-dt"),zones:new Array(ze+1)};for(let u=1;u<=ze;u++)r[p].zones[u]={textTemp:t.querySelector("#"+p+"-fd-zt"+u),textSetpoint:t.querySelector("#"+p+"-fd-zsp"+u),textFlow:t.querySelector("#"+p+"-fd-zv"+u),textRet:t.querySelector("#"+p+"-fd-zr"+u),label:t.querySelector("#"+p+"-fd-zn"+u),friendly:t.querySelector("#"+p+"-fd-zf"+u),path:t.querySelector("#"+p+"-fd-path-"+u)}});function n(p,u){p&&(p.textContent=u)}function c(p,u,w,y,f){let g=r[p];n(g.flowLabelEl,v("overview.flowDiagram.flow")),n(g.flowEl,fe(u)),n(g.retEl,v("overview.flowDiagram.returnShort")+" "+fe(w)),n(g.dtLabelEl,v("overview.flowDiagram.dt")),n(g.dtEl,y==null?"---":y.toFixed(1)+"\xB0C"),g.dtEl&&g.dtEl.setAttribute("fill",f)}function s(){n(t.querySelector("#mobile-fd-temp-head"),v("overview.graph.layers.temp").toUpperCase()),n(t.querySelector("#mobile-fd-flow-head"),v("overview.flowDiagram.flow")),n(t.querySelector("#mobile-fd-ret-head"),v("overview.flowDiagram.returnShort"))}function m(p,u,w){let y=r[p].zones[u];if(!y)return;let{enabled:f,pct:g,temp:_,setpoint:d,valve:S,returnTemp:L,hasReturn:h}=w,b=Ea(u,p==="desktop"?11:12),C=fe(_),N=d!=null?fe(d):"";n(y.label,"Z"+u),n(y.friendly,p==="desktop"?(b||"---")+(N?" ("+N+")":""):b||"---"),n(y.textTemp,C),n(y.textSetpoint,p==="desktop"?"":N?"("+N+")":""),n(y.textFlow,lt(S)),n(y.textRet,h?fe(L):"---"),y.label.setAttribute("fill",f?_a:ka),y.friendly.setAttribute("fill",f?Yo:ht),y.textSetpoint.setAttribute("fill",f?Yo:ht),y.textFlow.setAttribute("fill",Ma(g,f)),y.textRet.setAttribute("fill",h&&f?Sa:Jo);let R=y.path;if(!f)R.setAttribute("d",p==="desktop"?vt(u-1,1,2):xt(u-1,1,2)),R.setAttribute("fill","#062a3a"),R.setAttribute("opacity","0.38");else{let q=p==="desktop"?G:H,F=Math.max(2.5,g*q.bgDstHW),A=Math.max(1.3,g*q.srcHW);R.setAttribute("d",p==="desktop"?vt(u-1,A,F):xt(u-1,A,F)),R.setAttribute("fill","url(#"+p+"-rg"+u+")"),R.setAttribute("opacity","1")}}function l(){let p=k(a.flow),u=k(a.ret),w=p!=null&&u!=null?Number(p)-Number(u):null,y=w==null||w<3?Ko:w>8?Ca:La;o.forEach(f=>c(f,p,u,w,y));for(let f=1;f<=ze;f++){let g=k(i.temp(f)),_=k(i.setpoint(f)),d=k(i.valve(f)),S=K(i.enabled(f)),L=String(D(i.tempSource(f))||"Local Probe"),h=Aa(D(i.probe(f))||""),b=h?k(i.probeTemp(h)):null,C=L!=="Local Probe"&&b!=null&&!Number.isNaN(Number(b)),N=d!=null?Math.max(0,Math.min(100,Number(d)))/100:0,R={enabled:S,pct:N,temp:g,setpoint:_,valve:d,returnTemp:b,hasReturn:C};o.forEach(q=>m(q,f,R))}}z(a.flow,l),z(a.ret,l),I("zoneNames",l);for(let p=1;p<=ze;p++)z(i.temp(p),l),z(i.setpoint(p),l),z(i.valve(p),l),z(i.enabled(p),l),z(i.probe(p),l),z(i.tempSource(p),l);for(let p=1;p<=8;p++)z(i.probeTemp(p),l);s(),l()}});var Pa=48,Oa=1e3,jt="#ff8531",yt="#4dc7ff",$t="#ffce5b",Ra=2,zt=1e3,rr=220,Ae=46,Ha=52,ge=14,qa=44,wt=zt-Ae-Ha,Se=rr-ge-qa,Ee=ge+Se,Ia=`
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
.forecast-preview .fc-toggle[data-layer="wind"] { color: #4dc7ff; }
.forecast-preview .fc-toggle[data-layer="solar"] { color: var(--series-solar); }
.forecast-preview .fc-wind-guide {
  opacity: .58;
}
.forecast-preview .fc-wind-arrow {
  fill: #4dc7ff;
  stroke: rgba(4,18,28,.35);
  stroke-width: .28;
  stroke-linejoin: round;
  opacity: .88;
  vector-effect: non-scaling-stroke;
  filter: drop-shadow(0 0 2px rgba(77,199,255,.22));
}
.forecast-preview .fc-wind-arrow.now {
  fill: var(--series-solar);
}
`;T("monitor-forecast-preview",Ia);var Ba=()=>`
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
`;function Wa(e){if(!e)return v("common.noData");if(e<16e8)return v("common.clockSyncing");let t=new Date(e*1e3),o=t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),r=new Date,n=t.getFullYear()===r.getFullYear()&&t.getMonth()===r.getMonth()&&t.getDate()===r.getDate();return v("overview.weather.updated",{time:n?o:t.toLocaleDateString([],{month:"short",day:"numeric"})+" "+o})}function Za(e){return Number.isFinite(Number(e))?["N","NE","E","SE","S","SW","W","NW"][Math.round((Number(e)%360+360)%360/45)%8]:"---"}function ja(e){if(!Number.isFinite(Number(e)))return"---";let t=Math.round((Number(e)%360+360)%360);return Za(t)+" "+t+"\xB0"}function $a(e,t){let o=e.hours.slice(0,Pa),r=o.length,n=o.map(h=>h[0]),c=o.map(h=>h[1]),s=o.map(h=>h[2]),m=o.map(h=>h[3]||0),l=Eo(n,0,10),p=Math.max(2,...c)*1.15,u=h=>Ae+(r<=1?0:h/(r-1)*wt),w=h=>ge+(1-(h-l.min)/(l.max-l.min))*Se,y=h=>ge+(1-h/p)*Se,f=h=>ge+(1-Math.max(0,Math.min(1,h/Oa)))*Se,g=$("svg",{viewBox:`0 0 ${zt} ${rr}`,preserveAspectRatio:"xMidYMid meet"});for(let h=0;h<4;h++){let b=h/3,C=ge+b*Se;g.appendChild($("line",{x1:Ae,y1:C,x2:Ae+wt,y2:C,class:"chart-grid"})),t.temp&&g.appendChild($("text",{x:Ae-7,y:C+4,"text-anchor":"end",class:"chart-tick"},(l.max-(l.max-l.min)*b).toFixed(0)+"\xB0")),t.wind&&g.appendChild($("text",{x:Ae+wt+7,y:C+4,"text-anchor":"start",class:"chart-tick"},(p-p*b).toFixed(0)))}if(g.appendChild($("line",{x1:Ae,y1:Ee,x2:Ae+wt,y2:Ee,class:"chart-axis"})),t.temp&&g.appendChild($("text",{x:12,y:ge+Se/2,transform:`rotate(-90 12 ${(ge+Se/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"\xB0C")),t.wind&&g.appendChild($("text",{x:zt-12,y:ge+Se/2,transform:`rotate(90 ${zt-12} ${(ge+Se/2).toFixed(1)})`,"text-anchor":"middle",class:"chart-axis-label"},"m/s")),t.solar){let h="";for(let b=0;b<r;b++)h+=(b?" L ":"M ")+u(b).toFixed(1)+" "+f(m[b]).toFixed(1);h&&(h+=` L ${u(r-1).toFixed(1)} ${Ee} L ${u(0).toFixed(1)} ${Ee} Z`,g.appendChild($("path",{d:h,fill:"color-mix(in srgb, var(--series-solar) 18%, transparent)",stroke:"none"})))}let _=e.base_epoch?Math.floor((Date.now()/1e3-e.base_epoch)/3600):-1,d=new Date(e.base_epoch*1e3).getDate(),S=-1;for(let h=0;h<r;h++){let b=new Date((e.base_epoch+h*3600)*1e3),C=h===_,N=b.getDate()!==d;N&&S<0&&b.getHours()===0&&(S=h);let R=u(h),q=Ee+13;g.appendChild($("text",{x:R,y:q,"text-anchor":"end",transform:`rotate(-45 ${R.toFixed(1)} ${q})`,class:"chart-hour"+(C?" now":N?" day2":"")},String(b.getHours()).padStart(2,"0"))),C&&(g.appendChild($("line",{x1:R,y1:ge,x2:R,y2:Ee,stroke:"var(--series-solar)","stroke-width":"1","stroke-dasharray":"2 3",opacity:".55","vector-effect":"non-scaling-stroke"})),g.appendChild($("text",{x:R+4,y:ge+11,"text-anchor":"start",class:"chart-hour now"},"now")))}if(S>0){let h=u(S);g.appendChild($("line",{x1:h,y1:ge,x2:h,y2:Ee,stroke:"rgba(202,219,248,.26)","stroke-width":"1","stroke-dasharray":"4 4","vector-effect":"non-scaling-stroke"})),g.appendChild($("text",{x:h+4,y:ge+11,"text-anchor":"start",class:"chart-hour day2"},"+1d"))}if(t.wind){g.appendChild($("path",{d:qe(c.map((b,C)=>({x:u(C),y:y(b)}))),class:"fc-wind-guide",fill:"none",stroke:yt,"stroke-width":"1.5","stroke-linejoin":"round","stroke-linecap":"round"}));let h=$("g",{class:"fc-wind-arrows","aria-label":v("overview.weather.windArrows")});for(let b=0;b<r;b++){if(b%Ra!==0&&b!==_)continue;let C=Number(s[b]);if(!Number.isFinite(C))continue;let N=u(b),R=y(c[b]);h.appendChild($("path",{d:"M -4.8 -1.1 L .7 -1.1 L .7 -3.6 L 5.6 0 L .7 3.6 L .7 1.1 L -4.8 1.1 Z",class:"fc-wind-arrow"+(b===_?" now":""),transform:`translate(${N.toFixed(1)} ${R.toFixed(1)}) rotate(${(C-90).toFixed(1)})`}))}g.appendChild(h)}t.temp&&g.appendChild($("path",{d:qe(n.map((h,b)=>({x:u(b),y:w(h)}))),fill:"none",stroke:jt,"stroke-width":"2.6","stroke-linejoin":"round","stroke-linecap":"round"})),t.solar&&g.appendChild($("path",{d:qe(m.map((h,b)=>({x:u(b),y:f(h)}))),fill:"none",stroke:$t,"stroke-width":"1.8","stroke-linejoin":"round","stroke-linecap":"round",opacity:".85"}));let L=[];return t.temp&&L.push(h=>({y:w(n[h]),color:jt})),t.wind&&L.push(h=>({y:y(c[h]),color:yt})),t.solar&&L.push(h=>({y:f(m[h]),color:$t})),{svg:g,model:{count:r,plotTop:ge,plotBottom:Ee,xAt:u,label:h=>String(new Date((e.base_epoch+h*3600)*1e3).getHours()).padStart(2,"0")+":00",dots:h=>L.map(b=>b(h)),rows:h=>{let b=[];return t.temp&&b.push({color:jt,label:v("overview.graph.layers.temp"),value:n[h].toFixed(1)+"\xB0"}),t.wind&&(b.push({color:yt,label:v("overview.graph.layers.windDir"),value:c[h].toFixed(1)+" m/s"}),b.push({color:yt,label:v("overview.weather.tooltip.from"),value:ja(s[h])})),t.solar&&b.push({color:$t,label:v("overview.graph.layers.solar"),value:Math.round(m[h])+" W/m\xB2"}),b}}}}var $i=P({tag:"monitor-forecast-preview",render:Ba,onMount(e,t){let o=t.querySelector(".chart-sub"),r=t.querySelector(".fc-body"),n=t.matches(".forecast-preview")?t:t.querySelector(".forecast-preview"),c=Array.from(t.querySelectorAll(".fc-toggle")),s={temp:!0,wind:!0,solar:!0},m=null;function l(){c.forEach(u=>{let w=u.dataset.layer;u.classList.toggle("is-off",!s[w]),u.setAttribute("aria-pressed",s[w]?"true":"false")})}function p(){m&&(m(),m=null);let u=et(),w=u&&Array.isArray(u.hours)?u.hours:[];if(!(u?u.count||w.length:0)||!w.length||!u.base_epoch){o.textContent=v("common.noData"),r.innerHTML='<div style="color:var(--text-secondary);font-size:.8rem;text-align:center;padding:34px">'+v("overview.weather.notFetched")+"</div>";return}o.textContent=Wa(u.fetch_epoch),r.innerHTML="";let{svg:f,model:g}=$a(u,s);r.appendChild(f),m=dt(f,n,g)}c.forEach(u=>{u.addEventListener("click",()=>{let w=u.dataset.layer;s[w]=!s[w],l(),p()})}),I("forecastHours",p),E(t),l(),p()}});var Va={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#8a508f"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},Ga=`
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
`;T("logs-view",Ga);var Ua=()=>`
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
`;function Xa(e){let t=Va[e.level]||{label:"?",color:"var(--text-secondary)"},o=ar(e.tag||""),r=ar(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function ar(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Ki=P({tag:"logs-view",render:Ua,onMount(e,t){let o=t.querySelector(".logs-stream"),r=t.querySelector(".pause-btn"),n=t.querySelector(".clear-btn"),c=!1;function s(){if(c)return;let m=to();if(!m||!m.length){o.innerHTML='<div class="logs-empty">'+v("logs.waiting")+"</div>";return}let l=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=m.map(Xa).join(""),l&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{c=!c,r.textContent=c?v("logs.resume"):v("logs.pause"),r.classList.toggle("on",c),c||s()}),n.addEventListener("click",()=>{oo()}),I("deviceLog",s),E(t),s()}});var Ya=`
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
}`;T("diag-i2c",Ya);var Ka=()=>`
  <div class="diag-i2c">
    <div class="card-title" data-i18n="diagnostics.i2c.title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan" data-i18n="diagnostics.i2c.scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result" data-empty="1">No scan has been run yet.</pre>
  </div>
`,al=P({tag:"diag-i2c",render:Ka,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=Z("i2cResult")||v("diagnostics.i2c.empty")}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{lo()}),I("i2cResult",r),E(t),r()}});var Ja=`
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
  scrollbar-color: rgba(124,155,208,.25) transparent;
}
.diag-log::-webkit-scrollbar { width: 5px; }
.diag-log::-webkit-scrollbar-thumb { background: rgba(124,155,208,.25); border-radius: 999px; }
.diag-log::-webkit-scrollbar-track { background: transparent; }

.diag-log-empty { color: var(--text-secondary); font-size: .84rem; text-align: center; padding: 16px; }
.diag-log-item { display: flex; gap: 8px; padding: 5px 10px; border-bottom: 1px solid rgba(255,255,255,.08); font-size: .84rem; line-height: 1.5; }
.diag-log-item:last-child { border-bottom: none; }
.diag-log-time { font-family: var(--mono); color: var(--accent); font-size: .76rem; white-space: nowrap; flex-shrink: 0; }
.diag-log-msg { color: var(--text-strong); opacity: .9; }
`;T("diag-activity",Ja);var Qa=()=>`
  <div class="diag-activity">
    <div class="card-title" data-i18n="diagnostics.activity.title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function en(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">'+v("diagnostics.activity.empty")+"</div>";return}let o="";for(let r=t.length-1;r>=0;r--)o+='<div class="diag-log-item"><span class="diag-log-time">'+t[r].time+'</span><span class="diag-log-msg">'+t[r].msg+"</span></div>";e.innerHTML=o}var dl=P({tag:"diag-activity",render:Qa,onMount(e,t){let o=t.querySelector(".diag-log");function r(){en(o,Qt())}I("activityLog",r),E(t),r()}});var tn=`
.diag-manual-badge {
  display: none;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  border: 1px solid rgba(255,118,118,.45);
  background: rgba(83,32,32,.40);
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
`;T("diag-manual-badge",tn);var on=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text" data-i18n="diagnostics.manual">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,bl=P({tag:"diag-manual-badge",render:on,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let n=!!Z("manualMode");o&&o.classList.toggle("on",n)}I("manualMode",r),E(t),r()}});var rn=`
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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  border-color: rgba(255,133,49,.5);
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
  background: #efe6dd;
  transition: .2s ease;
}
.diag-zone-motor .sw.on {
  background: var(--blue);
  border-color: rgba(124,155,208,.4);
}
.diag-zone-motor .sw.on::after {
  transform: translateX(22px);
  background: #042a3b;
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
`;T("diag-zone-motor",rn);var an=e=>{let t=e.zone||Z("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">"+v("common.zone")+" "+r+"</option>";return`
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
  `},_l=P({tag:"diag-zone-motor-card",render:an,onMount(e,t){let o=Number(e.zone||Z("selectedZone")||1),r=!!Z("manualMode"),n=t.querySelector(".manual-mode-toggle"),c=t.querySelector(".motor-gated"),s=t.querySelector(".motor-zone-select"),m=t.querySelector(".motor-target-input"),l=t.querySelector(".motor-open-btn"),p=t.querySelector(".motor-close-btn"),u=t.querySelector(".motor-stop-btn"),w=()=>{let _=s.value||String(o),d="";for(let S=1;S<=6;S++)d+='<option value="'+S+'">'+v("common.zone")+" "+S+"</option>";s.innerHTML=d,s.value=_};function y(_){r=!!_,n&&(n.classList.toggle("on",r),n.setAttribute("aria-checked",r?"true":"false")),c&&c.classList.toggle("locked",!r),[s,m,l,p,u].forEach(d=>{d&&(d.disabled=!r)})}function f(){let _=!r;if(y(_),_){Et(!0);for(let d=1;d<=6;d++)Ft(d)}else Et(!1)}function g(){let _=k(i.motorTarget(o));m&&_!=null?m.value=Number(_).toFixed(0):m&&(m.value="0")}s==null||s.addEventListener("change",()=>{o=Number(s.value||1),g()}),n==null||n.addEventListener("click",f),n==null||n.addEventListener("keydown",_=>{_.key!==" "&&_.key!=="Enter"||(_.preventDefault(),f())});for(let _=1;_<=6;_++)z(i.motorTarget(_),g);g(),y(r),I("manualMode",()=>{y(!!Z("manualMode"))}),E(t),m==null||m.addEventListener("change",_=>{if(!r)return;let d=_.target.value;uo(o,d)}),l==null||l.addEventListener("click",()=>{r&&mo(o,1e4)}),p==null||p.addEventListener("click",()=>{r&&go(o,1e4)}),u==null||u.addEventListener("click",()=>{r&&Ft(o)})}});var nn=`
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
  outline: 2px solid rgba(124,155,208,.6);
  outline-offset: 1px;
  border-color: rgba(124,155,208,.55);
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
  border-color: rgba(255,133,49,.5);
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
`;T("diag-zone-recovery",nn);var sn=()=>`
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
  `,Ml=P({tag:"diag-zone-recovery-card",render:sn,onMount(e,t){let o=Number(Z("selectedZone")||1),r=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),c=t.querySelector(".recovery-relearn-btn"),s=t.querySelector(".recovery-status");I("selectedZone",()=>{o=Number(Z("selectedZone")||1)});let m=null;function l(u,w){s.textContent=u,s.className="recovery-status show "+(w?"ok":"err"),clearTimeout(m),m=setTimeout(()=>{s.classList.remove("show")},4e3)}function p(u,w){let y=u(o);l(w,!0),y&&typeof y.then=="function"&&y.then(f=>{f&&f.ok===!1&&l(v("diagnostics.recovery.rejected"),!1)}).catch(()=>l(v("diagnostics.recovery.unreachable"),!1))}r==null||r.addEventListener("click",()=>{p(fo,"\u2713 "+v("diagnostics.recovery.faultSent",{zone:J(o)}))}),n==null||n.addEventListener("click",()=>{confirm(v("diagnostics.recovery.confirmFactors",{zone:J(o)}))&&p(bo,"\u2713 "+v("diagnostics.recovery.factorsReset",{zone:J(o)}))}),c==null||c.addEventListener("click",()=>{confirm(v("diagnostics.recovery.confirmRelearn",{zone:J(o)}))&&p(ho,"\u2713 "+v("diagnostics.recovery.relearnStarted",{zone:J(o)}))}),E(t)}});var ln=`
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
`;T("diag-system-card",ln);var cn=()=>`
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
`,ql=P({tag:"diag-system-card",render:cn,onMount(e,t){let o=t.querySelector('[data-k="cpu0"]'),r=t.querySelector('[data-k="cpu1"]'),n=t.querySelector('[data-k="heap"]'),c=t.querySelector('[data-k="psram"]'),s=t.querySelector('[data-bar="cpu0"]'),m=t.querySelector('[data-bar="cpu1"]'),l=(w,y,f)=>{if(f==null||!Number.isFinite(Number(f))){w.textContent="\u2014",w.classList.remove("warn"),y.style.width="0%";return}let g=Math.max(0,Math.min(100,Number(f)));w.textContent=g.toFixed(0)+"%",w.classList.toggle("warn",g>=90),y.style.width=g+"%",y.style.backgroundPosition=g+"% 0"},p=(w,y,f)=>{if(y==null||!Number.isFinite(Number(y))){w.textContent="\u2014";return}let g=Number(y);w.textContent=g+" KB",w.classList.toggle("warn",f!=null&&g<f)},u=()=>{l(o,s,k(a.cpuLoadCore0)),l(r,m,k(a.cpuLoadCore1)),p(n,k(a.freeInternalKb),48),p(c,k(a.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{xo().catch(w=>console.error("[System] dump failed:",w))}),z(a.cpuLoadCore0,u),z(a.cpuLoadCore1,u),z(a.freeInternalKb,u),z(a.freePsramKb,u),E(t),u()}});var dn=.8,pn=`
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
`;T("preheat-factors-card",pn);var un=()=>{let e="";for(let t=1;t<=6;t++)e+=`
      <div class="pf-row" data-zone="${t}">
        <div class="pf-zone"></div>
        <div class="pf-track"><i class="pf-fill"></i></div>
        <div class="pf-value">---</div>
      </div>
    `;return`
    <div class="ui-card preheat-factors-card">
      <div class="ui-card-title"><span data-i18n="diagnostics.preheatFactors.title">Preheat Factors</span></div>
      <div class="pf-list">${e}</div>
      <div class="ui-note" data-i18n="diagnostics.preheatFactors.note">Learned simple-preheat head-start per zone. The control runs automatically; these values show how much earlier each room starts calling for heat.</div>
    </div>
  `};function mn(e){return Number.isFinite(e)?e.toFixed(2)+"C":"---"}var Vl=P({tag:"preheat-factors-card",render:un,onMount(e,t){function o(){for(let r=1;r<=6;r++){let n=t.querySelector('[data-zone="'+r+'"]'),c=Number(k(i.preheatAdvance(r))),s=Number.isFinite(c);n.querySelector(".pf-zone").textContent=J(r),n.querySelector(".pf-value").textContent=mn(c),n.querySelector(".pf-fill").style.width=s?Math.max(0,Math.min(100,c/dn*100))+"%":"0%"}}for(let r=1;r<=6;r++)z(i.preheatAdvance(r),o);I("zoneNames",o),E(t),o()}});var gn=`
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
`;T("settings-manifold-card",gn);var fn=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="ui-card settings-manifold-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.manifold.title">Manifold Configuration</span>${ve("settings.manifold.help")}</span></div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.type">Manifold Type</span>
        <span class="ui-field"><select class="ui-select sm-type"><option value="NO (Normally Open)" data-i18n="settings.manifold.normallyOpen">Normally Open (NO)</option><option value="NC (Normally Closed)" data-i18n="settings.manifold.normallyClosed">Normally Closed (NC)</option></select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.flowProbe">Flow Probe</span>
        <span class="ui-field"><select class="ui-select sm-flow">${e}</select></span>
      </div>
      <div class="ui-row">
        <span class="ui-label" data-i18n="settings.manifold.returnProbe">Return Probe</span>
        <span class="ui-field"><select class="ui-select sm-ret">${e}</select></span>
      </div>
      <div class="ui-section" data-i18n="settings.manifold.probeTemps">Probe Temperatures</div>
      <div class="probe-grid">${t}</div>

      <div class="ui-section" data-i18n="settings.manifold.minZoneFlow">Minimum Zone Flow</div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="common.enabled">Enabled</span> <span class="ui-sublabel" data-i18n="settings.manifold.minFlowEnabledSub">manual floor for a modulating heat source, independent of the bridge</span></span>
        <span class="ui-field"><div class="ui-toggle sm-minflow-always" role="switch" data-i18n-label="settings.manifold.minZoneFlow" aria-label="Enable minimum zone flow"></div></span>
      </div>
      <div class="ui-row">
        <span class="ui-label"><span data-i18n="settings.manifold.minValveOpening">Min valve opening (%)</span> <span class="ui-sublabel" data-i18n="settings.manifold.minValveOpeningSub">floor held on every enabled zone while active</span></span>
        <span class="ui-field"><input class="ui-input sm-minflow" type="number" min="0" max="50" step="1" placeholder="15" /></span>
      </div>
    </div>
  `},oc=P({tag:"settings-manifold-card",render:fn,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),n=t.querySelector(".sm-ret"),c=t.querySelector(".sm-minflow-always"),s=t.querySelector(".sm-minflow"),m=ce(t);m.select(o,{read:()=>D(a.manifoldType)||"NO (Normally Open)",commit:p=>me("manifold_type",p)}),m.select(r,{read:()=>D(a.manifoldFlowProbe)||"Probe 7",commit:p=>me("manifold_flow_probe",p)}),m.select(n,{read:()=>D(a.manifoldReturnProbe)||"Probe 8",commit:p=>me("manifold_return_probe",p)}),m.toggle(c,{read:()=>K(a.minimumFlowAlways),commit:p=>{let u=p?"on":"off";x(a.minimumFlowAlways,{state:u}),me("minimum_flow_always",u).catch(()=>x(a.minimumFlowAlways,{state:p?"off":"on"}))}}),m.num(s,{read:()=>k(a.minZoneFlowPct),commit:p=>{x(a.minZoneFlowPct,{value:p}),le("min_zone_flow_pct",p)}});function l(){for(let p=1;p<=8;p++){let u=t.querySelector('[data-probe="'+p+'"]');u&&(u.textContent=fe(k(i.probeTemp(p))))}}z(a.manifoldType,m.refresh),z(a.manifoldFlowProbe,m.refresh),z(a.manifoldReturnProbe,m.refresh),z(a.minimumFlowAlways,m.refresh),z(a.minZoneFlowPct,m.refresh);for(let p=1;p<=8;p++)z(i.probeTemp(p),l);E(t),m.refresh(),l()}});var bn=`
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
  background: #efe6dd;
  border-radius: 999px;
  transition: transform .2s ease;
}

.settings-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #042a3b;
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
  border-color: rgba(120,146,200,.52);
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
`;T("settings-control-card",bn);var hn=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title" data-i18n="settings.control.title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map" data-i18n="settings.control.resetProbeMap">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire" data-i18n="settings.control.dump1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart" data-i18n="settings.control.restart">Restart Device</button>
    </div>
  </div>
`,lc=P({tag:"settings-control-card",render:hn,onMount(e,t){E(t),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{he("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{he("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{he("restart")})}});var vn=`
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
`;T("settings-motor-calibration-card",vn);var St=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:a.genericRuntimeLimitSeconds,labelKey:"settings.motor.maxSafeRuntime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:a.closeThresholdMultiplier,labelKey:"settings.motor.closeThreshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:a.closeSlopeThreshold,labelKey:"settings.motor.closeSlope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:a.closeSlopeCurrentFactor,labelKey:"settings.motor.closeSlopeFloor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:a.openThresholdMultiplier,labelKey:"settings.motor.openThreshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:a.openSlopeThreshold,labelKey:"settings.motor.openSlope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:a.openSlopeCurrentFactor,labelKey:"settings.motor.openSlopeFloor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:a.openRippleLimitFactor,labelKey:"settings.motor.openRippleLimit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:a.relearnAfterMovements,labelKey:"settings.motor.relearnMovements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:a.relearnAfterHours,labelKey:"settings.motor.relearnHours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:a.learnedFactorMinSamples,labelKey:"settings.motor.learnMinSamples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:a.learnedFactorMaxDeviationPct,labelKey:"settings.motor.learnMaxDeviation",unit:"%"}],xn=()=>{let e="";for(let t=0;t<St.length;t++){let o=St[t],r=yn(o.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label"><span data-i18n="'+o.labelKey+'">'+v(o.labelKey)+"</span> ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
    <div class="ui-card settings-motor-cal-card">
      <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.motor.title">Motor Calibration &amp; Learning</span>${ve("settings.motor.help")}</span></div>
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

      <div class="ui-section" data-i18n="settings.motor.thresholds">Thresholds &amp; Learning</div>
      ${e}
    </div>
  `};function yn(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var hc=P({tag:"settings-motor-calibration-card",render:xn,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime"),n=t.querySelector(".mc-drivers-toggle"),c=ce(t);function s(l){if(l==="HmIP VdMot"&&le("hmip_runtime_limit_seconds",40),l==="Generic"){let p=Number(k(a.genericRuntimeLimitSeconds));(!Number.isFinite(p)||p<=0)&&le("generic_runtime_limit_seconds",45)}}c.toggle(n,{read:()=>K(a.drivers),commit:l=>nt(l)}),c.select(o,{read:()=>D(a.motorProfileDefault)||"HmIP VdMot",commit:l=>{me("motor_profile_default",l),s(l)}});function m(){let l=D(a.motorProfileDefault)||"HmIP VdMot";r.disabled=l==="HmIP VdMot"}c.num(r,{read:()=>(D(a.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:k(a.genericRuntimeLimitSeconds),commit:l=>{o.value==="Generic"&&le("generic_runtime_limit_seconds",l)}});for(let l=0;l<St.length;l++){let p=St[l];if(p.key==="generic_runtime_limit_seconds")continue;let u=t.querySelector(".smc-"+p.cls);u&&(c.num(u,{read:()=>k(p.id),commit:w=>le(p.key,w)}),z(p.id,c.refresh))}z(a.drivers,c.refresh),z(a.motorProfileDefault,()=>{c.refresh(),m()}),z(a.genericRuntimeLimitSeconds,c.refresh),z(a.hmipRuntimeLimitSeconds,c.refresh),E(t),s(D(a.motorProfileDefault)||"HmIP VdMot"),c.refresh(),m()}});var wn=`
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
`;T("settings-asgard-card",wn);var zn=()=>`
  <div class="ui-card settings-asgard-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.asgard.title">Modulating Heat Source</span>${ve("settings.asgard.help")}</span>
      <span class="asgard-role-badge slave">slave</span>
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

      <div class="ui-section" data-i18n="settings.asgard.recommendedSetpoint">Recommended setpoint</div>
      <div class="setpoint-box">
        <span class="setpoint-val sa-st-setpoint">\u2014</span>
        <span class="ui-note" data-i18n="settings.asgard.setpointNote">Fixed value to set as the virtual thermostat setpoint - the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
      </div>

      <div class="ui-section" data-i18n="settings.asgard.status">Status</div>
      <div class="status-grid">
        <span data-i18n="settings.asgard.peer">Peer</span><span class="val sa-st-peer">n/a</span>
        <span data-i18n="settings.asgard.lastPush">Last push</span><span class="val sa-st-push">\u2014</span>
        <span data-i18n="settings.asgard.zonesWeighted">Zones weighted</span><span class="val sa-st-zones">\u2014</span>
        <span data-i18n="settings.asgard.lastError">Last error</span><span class="val sa-st-err">\u2014</span>
      </div>
    </div>
  </div>
`,Lc=P({tag:"settings-asgard-card",render:zn,onMount(e,t){let o=t.querySelector(".asgard-role-badge"),r=t.querySelector(".sa-enable"),n=t.querySelector(".sa-coord"),c=t.querySelector(".sa-host"),s=t.querySelector(".sa-port"),m=t.querySelector(".sa-entity"),l=t.querySelector(".sa-peer"),p=t.querySelector(".sa-interval"),u=t.querySelector(".sa-st-peer"),w=t.querySelector(".sa-st-push"),y=t.querySelector(".sa-st-setpoint"),f=t.querySelector(".sa-st-zones"),g=t.querySelector(".sa-st-err"),_=t.querySelector(".sa-body"),d=ce(t);function S(N,R,q){return F=>{let A=F?"on":"off";x(N,{state:A}),me(R,A).catch(M=>{console.error(`[Asgard] Failed to update ${q}:`,M),x(N,{state:F?"off":"on"})})}}let L=N=>_.classList.toggle("is-disabled",!N);d.toggle(r,{read:()=>K(a.asgardEnabled),commit:S(a.asgardEnabled,"asgard_enabled","enabled"),onChange:L}),d.toggle(n,{read:()=>K(a.asgardCoordinator),commit:S(a.asgardCoordinator,"asgard_coordinator","coordinator")});function h(N,R){return q=>{x(N,{state:q}),co(R,q).catch(F=>console.error(`[Asgard] Failed to update ${R}:`,F))}}d.text(c,{read:()=>D(a.asgardHost),commit:h(a.asgardHost,"asgard_host")}),d.text(m,{read:()=>D(a.asgardEntityName),commit:h(a.asgardEntityName,"asgard_entity_name")}),d.text(l,{read:()=>D(a.asgardPeerHost),commit:h(a.asgardPeerHost,"asgard_peer_host")});function b(N,R){return q=>{x(N,{value:q}),le(R,q).catch(F=>console.error(`[Asgard] Failed to update ${R}:`,F))}}d.num(s,{read:()=>k(a.asgardPort),commit:b(a.asgardPort,"asgard_port")}),d.num(p,{read:()=>k(a.asgardPushIntervalS),commit:b(a.asgardPushIntervalS,"asgard_push_interval_s")});function C(){let N=D(a.asgardRole)||"slave";o.textContent=N,o.className="asgard-role-badge "+(N==="master"?"master":"slave");let R=D(a.asgardPeerStatus)||v("common.na");u.textContent=R,u.classList.toggle("warn",R==="stale"||R==="unreachable");let q=k(a.asgardLastPushC),F=k(a.asgardLastPushAgeS);if(q!=null&&Number.isFinite(q)&&F!=null){let ae=F<120?v("settings.asgard.ageSeconds",{value:Math.round(F)}):v("settings.asgard.ageMinutes",{value:Math.round(F/60)});w.textContent=`${q.toFixed(2)}\xB0C (${ae})`}else w.textContent="\u2014";let A=k(a.asgardSetpointC);y.textContent=A!=null&&Number.isFinite(A)?`${A.toFixed(1)}\xB0C`:"\u2014";let M=k(a.asgardLocalZones),j=k(a.asgardPeerZones);f.textContent=M!=null?`${M} ${v("common.local")} + ${j||0} ${v("common.peer")}`:"\u2014";let Y=D(a.asgardLastError);g.textContent=Y||"\u2014",g.classList.toggle("warn",!!Y)}z(a.asgardEnabled,d.refresh),z(a.asgardCoordinator,d.refresh),z(a.asgardRole,C),z(a.asgardPeerStatus,C),z(a.asgardLastPushC,C),z(a.asgardSetpointC,C),z(a.asgardLastPushAgeS,C),z(a.asgardLocalZones,C),z(a.asgardPeerZones,C),z(a.asgardLastError,C),z(a.asgardHost,d.refresh),z(a.asgardEntityName,d.refresh),z(a.asgardPeerHost,d.refresh),z(a.asgardPort,d.refresh),z(a.asgardPushIntervalS,d.refresh),E(t),d.refresh(),C()}});var nr=[1,2,3,4,5,6],Sn=`
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
  border-color: rgba(120,146,200,.52);
}
.settings-forecast-card .fc-fetch-btn:disabled {
  opacity: .5;
  cursor: default;
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
`;T("settings-forecast-card",Sn);var _n=e=>`
  <tr data-zone="${e}">
    <td><span data-i18n="common.zone">Zone</span> ${e}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,kn=()=>`
  <div class="ui-card settings-forecast-card">
    <div class="ui-card-title">
      <span class="ui-title-text"><span data-i18n="settings.forecast.title">Forecast Preload</span>${ve("settings.forecast.help")}</span>
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

      <div class="ui-section" data-i18n="settings.forecast.perZoneNow">Per-zone preload (now)</div>
      <table class="zone-table">
        <thead>
          <tr><th data-i18n="settings.forecast.zone">Zone</th><th data-i18n="settings.forecast.activeOffset">Active offset</th></tr>
        </thead>
        <tbody class="fc-zone-body">
          ${nr.map(_n).join("")}
        </tbody>
      </table>
      <div class="ui-note fc-note" data-i18n="settings.forecast.zoneNote">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
  </div>
`,Pc=P({tag:"settings-forecast-card",render:kn,onMount(e,t){let o=t.querySelector(".fc-badge"),r=t.querySelector(".fc-enable"),n=t.querySelector(".fc-body"),c=t.querySelector(".fc-lat"),s=t.querySelector(".fc-lon"),m=t.querySelector(".fc-threshold"),l=t.querySelector(".fc-maxoffset"),p=t.querySelector(".fc-age"),u=t.querySelector(".fc-error"),w=t.querySelector(".fc-fetch-btn"),y=ce(t);function f(h){if(!h)return"";if(h<16e8)return v("common.clockSyncing");let b=new Date(h*1e3),C=b.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}),N=new Date;return b.getFullYear()===N.getFullYear()&&b.getMonth()===N.getMonth()&&b.getDate()===N.getDate()?C:b.toLocaleDateString([],{month:"short",day:"numeric"})+" "+C}function g(){let h=f(k(a.forecastFetchEpoch));p.textContent=h?v("settings.forecast.lastFetch",{time:h}):"";let b=D(a.forecastLastError);u.textContent=b||""}w.addEventListener("click",()=>{w.disabled=!0,w.textContent=v("settings.forecast.fetching"),he("trigger_forecast_fetch").catch(()=>{}),setTimeout(()=>{Ze()},15e3),setTimeout(()=>{w.disabled=!1,w.textContent=v("settings.forecast.fetchNow")},2e4)});let _=h=>{n&&n.classList.toggle("is-disabled",!h)};y.toggle(r,{read:()=>K(a.forecastEnabled),onChange:_,commit:h=>{let b=h?"on":"off";x(a.forecastEnabled,{state:b}),me("forecast_enabled",b).catch(C=>{console.error("[Forecast] toggle failed:",C),x(a.forecastEnabled,{state:h?"off":"on"})})}});function d(h,b){return C=>{x(h,{value:C}),le(b,C).catch(N=>console.error(`[Forecast] ${b} failed:`,N))}}y.num(c,{nostep:!0,read:()=>k(a.forecastLatitude),commit:d(a.forecastLatitude,"forecast_latitude")}),y.num(s,{nostep:!0,read:()=>k(a.forecastLongitude),commit:d(a.forecastLongitude,"forecast_longitude")}),y.num(m,{read:()=>k(a.forecastLoadThreshold),commit:d(a.forecastLoadThreshold,"forecast_load_threshold")}),y.num(l,{read:()=>k(a.forecastMaxOffsetC),commit:d(a.forecastMaxOffsetC,"forecast_max_offset_c")});function S(){let h=D(a.forecastStatus)||"disabled";o.textContent=h,o.className="fc-badge",h==="ok"?o.classList.add("ok"):(h==="stale"||h.indexOf("external")>=0)&&o.classList.add("external")}function L(){t.querySelectorAll(".fc-zone-body tr").forEach(h=>{let b=parseInt(h.getAttribute("data-zone"),10),C=h.querySelector(".fc-offset"),N=k(i.forecastOffset(b)),R=k(i.forecastPeakH(b));N!=null&&N>.01?(C.textContent=`+${N.toFixed(1)}\xB0`+(R!=null&&R>=0?` (${R}h)`:""),C.classList.add("active")):(C.textContent="\u2014",C.classList.remove("active"))})}z(a.forecastStatus,S),z(a.forecastEnabled,()=>{y.refresh(),S()}),z(a.forecastLatitude,y.refresh),z(a.forecastLongitude,y.refresh),z(a.forecastLoadThreshold,y.refresh),z(a.forecastMaxOffsetC,y.refresh),z(a.forecastFetchEpoch,g),z(a.forecastLastError,g),nr.forEach(h=>{z(i.forecastOffset(h),L)}),E(t),S(),g(),L(),y.refresh()}});var sr=[1,2,3,4,5,6],Ln=`
.settings-balancing-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; margin-top: 4px; }
.settings-balancing-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px;
}
.settings-balancing-card .zone-table th:first-child { text-align: left; }
.settings-balancing-card .zone-table td { padding: 4px 2px; text-align: center; font-family: var(--mono); color: var(--text-secondary); }
.settings-balancing-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; font-family: inherit; }
.settings-balancing-card .zone-table .eff { color: var(--text-strong); font-weight: 700; }
.settings-balancing-card .zone-table .err.cold { color: #FFB4B4; }
.settings-balancing-card .zone-table .err.warm { color: #CBFFD0; }
.settings-balancing-card .bal-reset { width: 100%; }
`;T("settings-balancing-card",Ln);var Cn=e=>`
  <tr data-zone="${e}">
    <td><span data-i18n="common.zone">Zone</span> ${e}</td>
    <td class="bal-static">\u2014</td>
    <td class="bal-adapt">\u2014</td>
    <td class="bal-eff eff">\u2014</td>
    <td class="bal-err err">\u2014</td>
  </tr>
`,Fn=()=>`
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.balancing.title">Hydraulic Balancing</span>${ve("settings.balancing.help")}</span></div>

    <div class="ui-row">
      <span class="ui-label" data-i18n="settings.balancing.mode">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option value="Static" data-i18n="settings.balancing.static">Static</option>
        <option value="Adaptive" data-i18n="settings.balancing.adaptive">Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note" data-i18n="settings.balancing.note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top - no return probes - nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="ui-section" data-i18n="settings.balancing.perZone">Per-zone factors</div>
    <table class="zone-table">
      <thead>
        <tr><th data-i18n="common.zone">Zone</th><th data-i18n="settings.balancing.prior">Prior</th><th data-i18n="settings.balancing.learned">Learned</th><th data-i18n="settings.balancing.effective">Effective</th><th data-i18n="settings.balancing.error">Error</th></tr>
      </thead>
      <tbody class="bal-zone-body">
        ${sr.map(Cn).join("")}
      </tbody>
    </table>
    <div class="ui-note" data-i18n="settings.balancing.factorNote">Prior = static design factor \xB7 Learned = adaptive multiplier \xB7 Effective = prior \xD7 learned (the valve scale applied). Error is the long-window setpoint-room average a cold (+) loop is boosted on, a warm (-) loop throttled.</div>

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
`,jc=P({tag:"settings-balancing-card",render:Fn,onMount(e,t){let o=t.querySelector(".bal-mode"),r=t.querySelector(".bal-adaptive-body"),n=t.querySelector(".bal-interval"),c=t.querySelector(".bal-step"),s=t.querySelector(".bal-min"),m=t.querySelector(".bal-max"),l=ce(t),p=f=>{r&&r.classList.toggle("is-disabled",f!=="Adaptive")};l.select(o,{read:()=>D(a.balanceMode)||"Static",commit:f=>me("balance_mode",f)}),o.addEventListener("change",()=>p(o.value));function u(f,g){return _=>{x(f,{value:_}),le(g,_).catch(d=>console.error(`[Balancing] ${g} failed:`,d))}}l.num(n,{read:()=>k(a.adaptIntervalS),commit:u(a.adaptIntervalS,"adapt_interval_s")}),l.num(c,{read:()=>k(a.adaptStep),commit:u(a.adaptStep,"adapt_step")}),l.num(s,{read:()=>k(a.adaptMin),commit:u(a.adaptMin,"adapt_min")}),l.num(m,{read:()=>k(a.adaptMax),commit:u(a.adaptMax,"adapt_max")}),t.querySelector(".bal-reset").addEventListener("click",()=>{vo().catch(f=>console.error("[Balancing] reset failed:",f))});let w=(f,g=2)=>f!=null&&Number.isFinite(Number(f))?Number(f).toFixed(g):"\u2014";function y(){t.querySelectorAll(".bal-zone-body tr").forEach(f=>{let g=parseInt(f.getAttribute("data-zone"),10);f.querySelector(".bal-static").textContent=w(k(i.staticFactor(g))),f.querySelector(".bal-adapt").textContent=w(k(i.balanceAdapt(g))),f.querySelector(".bal-eff").textContent=w(k(i.balanceFactor(g)));let _=k(i.adaptErr(g)),d=f.querySelector(".bal-err");if(d.classList.remove("cold","warm"),_==null||!Number.isFinite(Number(_)))d.textContent="\u2014";else{d.textContent=(_>=0?"+":"")+Number(_).toFixed(2);let S=_>.05?"cold":_<-.05?"warm":"";S&&d.classList.add(S)}})}z(a.balanceMode,()=>{l.refresh(),p(D(a.balanceMode)||"Static")}),z(a.adaptIntervalS,l.refresh),z(a.adaptStep,l.refresh),z(a.adaptMin,l.refresh),z(a.adaptMax,l.refresh),sr.forEach(f=>{z(i.staticFactor(f),y),z(i.balanceAdapt(f),y),z(i.balanceFactor(f),y),z(i.adaptErr(f),y)}),E(t),l.refresh(),p(D(a.balanceMode)||"Static"),y()}});var En=`
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
`;T("smart-preheat-card",En);var An=()=>`
  <div class="ui-card smart-preheat-card">
    <div class="ui-card-title"><span class="ui-title-text"><span data-i18n="settings.preheat.title">Preheat</span>${ve("settings.preheat.help")}</span></div>
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
`,Qc=P({tag:"smart-preheat-card",render:An,onMount(e,t){let o=t.querySelector(".absorb-toggle"),r=t.querySelector(".absorb-badge"),n=t.querySelector(".absorb-band"),c=t.querySelector(".absorb-delta"),s=t.querySelector(".absorb-body"),m=ce(t),l=u=>{s&&s.classList.toggle("is-disabled",!u)};m.toggle(o,{read:()=>K(a.preheatAbsorbEnabled),onChange:l,commit:u=>{let w=u?"on":"off";x(a.preheatAbsorbEnabled,{state:w}),me("preheat_absorb_enabled",w)}}),m.num(n,{read:()=>k(a.preheatAbsorbBandC),commit:u=>{x(a.preheatAbsorbBandC,{value:u}),le("preheat_absorb_band_c",u)}}),m.num(c,{read:()=>k(a.preheatDetectDeltaC),commit:u=>{x(a.preheatDetectDeltaC,{value:u}),le("preheat_detect_delta_c",u)}});function p(){let u=String(D(a.preheatAbsorbing)||"").toLowerCase()==="active";r.textContent=u?v("common.active"):v("common.idle"),r.classList.toggle("active",u)}z(a.preheatAbsorbEnabled,m.refresh),z(a.preheatAbsorbing,p),z(a.preheatAbsorbBandC,m.refresh),z(a.preheatDetectDeltaC,m.refresh),E(t),m.refresh(),p()}});var Mn=`
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
`;T("settings-smart-heating",Mn);var Nn=()=>`
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`,rd=P({tag:"settings-smart-heating-card",render:Nn,onMount(e,t){t.querySelector(".sh-preheat-slot").appendChild(V("smart-preheat-card")),t.querySelector(".sh-forecast-slot").appendChild(V("settings-forecast-card"))}});var Tn=`
@import url("https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap");

:root {
  /* ===========================================================
     Palette (sunset ramp, cool-dark \u2192 warm-light):
       #00202e #003f5c #2c4875 #8a508f #bc5090
       #ff6361 #ff8531 #ffa600 #ffd380
     Dark cool tones \u2192 surfaces/borders; orange \u2192 primary accent,
     purple \u2192 secondary/cool (no blue in the UI or charts); warm
     members \u2192 data series + states. Greens for "OK" status are kept
     (the palette has no green) for status legibility.
     =========================================================== */
  --accent: #ff8531;          /* orange \u2014 primary accent */
  --blue: #8a508f;            /* purple \u2014 secondary / cool accent (replaces blue) */
  /* Chart data series \u2014 orange (warm) + purple (cool), no blue. */
  --series-warm: #ff8531;
  --series-cool: #8a508f;
  --series-cool-fill: rgba(138,80,143,.16);
  --series-solar: #ffc14d;    /* gold \u2014 solar irradiance / current-hour highlight */
  /* Axis/tick label color \u2014 warm-neutral, legible on the dark panel. */
  --chart-axis: rgba(233,222,210,.82);
  --bg: #00202e;
  --surface: #003f5c;
  --card: #042a3b;
  --border: rgba(120,146,200,.22);
  --text: #FFFFFF;
  --text-strong: #FFF4E6;
  --text-secondary: rgba(255,239,224,.84);
  --muted: rgba(247,233,221,.74);
  --text-faint: rgba(229,216,222,.56);
  --text-on-accent: #00202e;
  --soft: rgba(124,155,208,.12);
  --panel-border: rgba(120,146,200,.28);
  --panel-bg: rgba(0,63,92,.40);
  --panel-bg-vibrant: rgba(0,63,92,.44);
  --panel-shadow: inset 0 1px 0 rgba(255,255,255,.03), 0 24px 60px rgba(0,0,0,.42);
  --state-ok: #79d17e;
  --state-warn: #ffa600;
  --state-danger: #ff6361;
  --state-disabled: #6E7E96;
  --control-bg: rgba(124,155,208,.10);
  --control-bg-hover: rgba(124,155,208,.16);
  --control-border: rgba(120,146,200,.30);
  --control-border-strong: rgba(120,146,200,.45);
  --viz-flow-low: #8a508f;
  --viz-flow-mid: #bc5090;
  --viz-flow-high: #ff8531;
  --viz-flow-hot: #ffa600;
  --viz-delta-low: #8a508f;
  --viz-delta-ok: #66BB6A;
  --viz-delta-high: #ff6361;
  --green: #79d17e;
  --red: #ff6361;
  --mono: "Montserrat", sans-serif;
  --side-w: 260px;
  --side-collapsed: 76px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 12px; scroll-behavior: smooth; }
body {
  font-family: "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(1400px 760px at 92% -14%, rgba(255,133,49,.12), transparent 56%),
    radial-gradient(1200px 820px at 18% -8%, rgba(138,80,143,.16), transparent 64%),
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

/* Single row of 4 equal-height columns; cards stretch to fill via flex. */
.settings-layout {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  align-items: stretch;
}
.settings-layout > * { display: flex; }
.settings-layout > * > * { flex: 1; }
/* Balancing card carries a 6-zone table \u2014 give it the full row below the four. */
.settings-balancing-slot { grid-column: 1 / -1; }

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

@media (max-width: 1200px) {
  .settings-layout { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 860px) {
  .zone-layout,
  .dashboard-grid,
  .settings-layout,
  .logs-layout { grid-template-columns: 1fr; }

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
  outline: 2px solid rgba(124,155,208,.72);
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
`;T("app-root",Tn);var Dn=e=>`
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
          <div class="settings-manifold-slot"></div>
          <div class="settings-asgard-slot"></div>
          <div class="settings-motor-cal-slot"></div>
          <div class="settings-smart-heating-slot"></div>
          <div class="settings-balancing-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="diagnostics">
        <div class="logs-layout">
          <div class="logs-main-col"></div>
          <div class="logs-side-col"></div>
        </div>
      </section>
      <div class="ftr" data-i18n="footer.product">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;P({tag:"app-root",render:Dn,onMount(e,t){t.querySelector(".hdr").appendChild(V("hv6-header")),t.querySelector(".overview-flow").appendChild(V("flow-diagram")),t.querySelector(".overview-forecast").appendChild(V("monitor-forecast-preview")),t.querySelector(".overview-timeline").appendChild(V("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(V("graph-widgets",{variant:"flow-return"})),t.querySelector(".zone-selector").appendChild(V("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(V("zone-detail",{zone:Z("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(V("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(V("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(V("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(V("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(V("settings-asgard-card")),t.querySelector(".settings-motor-cal-slot").appendChild(V("settings-motor-calibration-card")),t.querySelector(".settings-smart-heating-slot").appendChild(V("settings-smart-heating-card")),t.querySelector(".settings-balancing-slot").appendChild(V("settings-balancing-card"));let o=t.querySelector(".logs-main-col");o.appendChild(V("logs-view")),o.appendChild(V("diag-activity"));let r=t.querySelector(".logs-side-col");r.appendChild(V("connectivity-card")),r.appendChild(V("diag-system-card")),r.appendChild(V("preheat-factors-card")),r.appendChild(V("diag-zone-motor-card",{zone:Z("selectedZone")||1})),r.appendChild(V("settings-control-card")),r.appendChild(V("diag-manual-badge")),r.appendChild(V("diag-i2c"));let n=t.querySelectorAll(".sec");function c(){let s=Z("section");n.forEach(m=>{m.classList.toggle("active",m.getAttribute("data-section")===s)})}I("section",c),E(t),c()}});function Pn(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(V("app-root")),Tt()}Pn();})();

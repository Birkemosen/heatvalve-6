(()=>{var wt={},Fe={};function k(e){return wt[e.tag]=e,e}function q(e,t){let o=wt[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let n=o.state(t||{});for(let l in n)r[l]=n[l]}if(o.methods)for(let n in o.methods)r[n]=o.methods[n];let s=document.createElement("div");s.innerHTML=o.render(r);let i=s.firstElementChild;return o.onMount&&o.onMount(r,i),i}function b(e,t){(Fe[e]||(Fe[e]=[])).push(t)}function j(e){let t=Fe[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var U=6,Er=28,Me=Object.create(null),Lr=Ar(),N={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Mr(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:Lr,manualMode:!1,zoneStateHistory:null,deviceLog:[],deviceLogSeq:0,forecastHours:null},Fr=300;function Mr(){let e=Object.create(null);for(let t=1;t<=U;t++)e[t]=[];return e}function Ar(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<U;)e.push("");return e.slice(0,U)}function Nr(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(N.zoneNames))}catch(e){}}function V(e){return"$dashboard:"+e}function Ae(e){return Math.max(1,Math.min(U,Number(e)||1))}function _t(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function z(e){let t=Me[e];return t?t.v!=null?t.v:t.value!=null?t.value:_t(t.s!=null?t.s:t.state):null}function E(e){let t=Me[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Dr(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function B(e){return Dr(E(e))}function m(e,t){let o=Me[e];o||(o=Me[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);j(e),e==="text_sensor-firmware_version"&&be("firmwareVersion",E(e)||"")}function D(e,t){b(V(e),t)}function T(e){return N[e]}function be(e,t){N[e]=t,j(V(e))}function zt(e){N.section!==e&&(N.section=e,j(V("section")))}function St(e){let t=Ae(e);N.selectedZone!==t&&(N.selectedZone=t,j(V("selectedZone")))}function ve(e){let t=!!e;N.live!==t&&(N.live=t,j(V("live")))}function kt(){N.pendingWrites+=1,j(V("pendingWrites"))}function ot(){N.pendingWrites=Math.max(0,N.pendingWrites-1),N.lastWriteAt=Date.now(),j(V("pendingWrites"))}function Ct(){return N.pendingWrites>0?!0:Date.now()-N.lastWriteAt<2e3}function Et(e,t){let o=Ae(e)-1;N.zoneNames[o]=String(t||"").trim(),Nr(),j(V("zoneNames"))}function pe(e){return N.zoneNames[Ae(e)-1]||""}function ee(e){let t=Ae(e),o=pe(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function he(e){N.i2cResult=e||"No scan has been run yet.",j(V("i2cResult"))}function L(e,t){let o={time:Tr(),msg:String(e||"")};for(N.activityLog.push(o);N.activityLog.length>60;)N.activityLog.shift();if(t>=1&&t<=U){let r=N.zoneLog[t];for(r.push(o);r.length>8;)r.shift();j(V("zoneLog:"+t))}j(V("activityLog"))}function Lt(e){return e>=1&&e<=U?N.zoneLog[e]:N.activityLog}function rt(e,t){let o=N[e];if(!Array.isArray(o))return;let r=_t(t);if(r!=null){for(o.push(r);o.length>Er;)o.shift();j(V(e))}}function ze(e){let t=Date.now();if(!e&&t-N.lastHistoryAt<3200)return;N.lastHistoryAt=t;let o=0,r=0;for(let s=1;s<=U;s++){let i=z("sensor-zone_"+s+"_valve_pct");i!=null&&(o+=i,r+=1)}rt("historyFlow",z("sensor-manifold_flow_temperature")),rt("historyReturn",z("sensor-manifold_return_temperature")),rt("historyDemand",r?o/r:0)}function Tr(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Ne(e){N.zoneStateHistory=e||null,j(V("zoneStateHistory"))}function Ft(){return N.deviceLogSeq}function De(e,t){if(Array.isArray(e)&&e.length){for(let o of e)N.deviceLog.push({seq:o[0],level:o[1],tag:o[2],msg:o[3]}),o[0]>N.deviceLogSeq&&(N.deviceLogSeq=o[0]);for(;N.deviceLog.length>Fr;)N.deviceLog.shift();j(V("deviceLog"))}typeof t=="number"&&t>N.deviceLogSeq&&(N.deviceLogSeq=t-1)}function Mt(){return N.deviceLog}function At(){N.deviceLog=[],j(V("deviceLog"))}function Te(e){N.forecastHours=e||null,j(V("forecastHours"))}function Nt(){return N.forecastHours}var d={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h",staticFactor:e=>"sensor-zone_"+e+"_static_factor",balanceFactor:e=>"sensor-zone_"+e+"_balance_factor",balanceAdapt:e=>"sensor-zone_"+e+"_balance_adapt",adaptErr:e=>"sensor-zone_"+e+"_adapt_err"},a={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",minZoneFlowPct:"number-min_zone_flow_pct",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c",balanceMode:"select-balance_mode",adaptIntervalS:"number-adapt_interval_s",adaptStep:"number-adapt_step",adaptMin:"number-adapt_min",adaptMax:"number-adapt_max",cpuLoadCore0:"sensor-cpu_load_core0",cpuLoadCore1:"sensor-cpu_load_core1",freeInternalKb:"sensor-free_internal_kb",freePsramKb:"sensor-free_psram_kb"};var Z=6,Or=8,Dt=null,xe=0,Oe=1,Tt=[[3,"hv6_zone","Control cycle: 4 zones heating, house avg 21.3\xB0C"],[3,"hv6_valve","Motor 2 reached open endstop (ripples=412)"],[5,"hv6_ripple","ADC DMA buffer drained, 2048 samples"],[3,"hv6_forecast","Forecast updated: 48 hours from Open-Meteo"],[2,"hv6_zone","Zone 5 disabled \u2014 skipping control"],[3,"hv6_asgard","Pushed z1 thermostat 21.4\xB0C to Asgard"]],M={temp:new Float32Array(Z),setpoint:new Float32Array(Z),valve:new Float32Array(Z),enabled:new Uint8Array(Z),driversEnabled:1,fault:0,manualMode:0};function Pr(){M.manualMode=0,be("manualMode",!1);for(let n=0;n<Z;n++){M.temp[n]=20.5+n*.4,M.setpoint[n]=21+n%3*.5,M.valve[n]=12+n*8,M.enabled[n]=n===4?0:1;let l=n+1;m(d.temp(l),{value:M.temp[n]}),m(d.setpoint(l),{value:M.setpoint[n]}),m(d.valve(l),{value:M.valve[n]}),m(d.state(l),{state:M.valve[n]>5?"heating":"idle"}),m(d.enabled(l),{value:!!M.enabled[n],state:M.enabled[n]?"on":"off"}),m(d.probe(l),{state:"Probe "+l}),m(d.tempSource(l),{state:l%2?"Local Probe":"BLE"}),m(d.syncTo(l),{state:"None"}),m(d.pipeType(l),{state:"PEX 16mm"}),m(d.area(l),{value:8+l*3.5}),m(d.spacing(l),{value:[150,200,150,100,200,150][n]}),m(d.ble(l),{state:"AA:BB:CC:DD:EE:0"+l}),m(d.exteriorWalls(l),{state:["N","E","S","W","N,E","S,W"][n]}),m(d.windExposure(l),{value:[.5,.5,.5,.5,.7,.7][n]}),m(d.solarGain(l),{value:.3}),m(d.thermalLeadH(l),{value:4}),m(d.preheatAdvance(l),{value:.08+n*.03});let u=[.62,.78,1,.55,.88,.7][n],g=[1.08,.95,1,1.15,.9,1.02][n];m(d.staticFactor(l),{value:u}),m(d.balanceAdapt(l),{value:g}),m(d.balanceFactor(l),{value:Math.min(1,u*g)}),m(d.adaptErr(l),{value:[.12,-.05,0,.22,-.1,.03][n]})}for(let n=1;n<=Or;n++){let l=n<=Z?n:Z,u=M.temp[l-1]+(n>Z?1:.1*n);m(d.probeTemp(n),{value:u})}m(a.flow,{value:34.1}),m(a.ret,{value:30.4}),m(a.uptime,{value:18*3600+720}),m(a.wifi,{value:-57}),m(a.drivers,{value:!0,state:"on"}),m(a.fault,{value:!1,state:"off"}),m(a.ip,{state:"192.168.1.86"}),m(a.ssid,{state:"MockLab"}),m(a.mac,{state:"D8:3B:DA:12:34:56"}),m(a.firmware,{state:"0.5.x-mock"}),m(a.manifoldFlowProbe,{state:"Probe 7"}),m(a.manifoldReturnProbe,{state:"Probe 8"}),m(a.manifoldType,{state:"NC (Normally Closed)"}),m(a.motorProfileDefault,{state:"HmIP VdMot"}),m(a.closeThresholdMultiplier,{value:1.7}),m(a.closeSlopeThreshold,{value:1}),m(a.closeSlopeCurrentFactor,{value:1.4}),m(a.openThresholdMultiplier,{value:1.7}),m(a.openSlopeThreshold,{value:.8}),m(a.openSlopeCurrentFactor,{value:1.3}),m(a.openRippleLimitFactor,{value:1}),m(a.genericRuntimeLimitSeconds,{value:45}),m(a.hmipRuntimeLimitSeconds,{value:40}),m(a.relearnAfterMovements,{value:2e3}),m(a.relearnAfterHours,{value:168}),m(a.learnedFactorMinSamples,{value:3}),m(a.learnedFactorMaxDeviationPct,{value:12}),m(a.simplePreheatEnabled,{state:"on"}),m(a.balanceMode,{state:"Adaptive"}),m(a.adaptIntervalS,{value:3600}),m(a.adaptStep,{value:.02}),m(a.adaptMin,{value:.5}),m(a.adaptMax,{value:1.5}),m(a.minZoneFlowPct,{value:15}),m(a.cpuLoadCore0,{value:18.5}),m(a.cpuLoadCore1,{value:7.2}),m(a.freeInternalKb,{value:142}),m(a.freePsramKb,{value:7800}),ze(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let n=0;n<o;n++){let l=(o-1-n)*e,u=t-l,g=Math.floor(n/12)%24,f=r.map(p=>p[g%p.length]),x=l/3600,_=x>2.5&&x<3.5||x>8.5&&x<9.5?1:0,y=f.filter(p=>p===5).length,h=Math.round(Math.min(100,y*15+Math.abs(Math.sin(n/8))*6)),v=Number((30+y*1.4+Math.sin(n/11)*1.5).toFixed(1)),c=Number((v-(1.4+y*.35)).toFixed(1));s.push([u,...f,_,v,c,h])}Ne({interval_s:e,uptime_s:t,count:o,entries:s});let i=[];for(let n=0;n<48;n++){let l=6-3*Math.sin(n/24*Math.PI)-(n>10&&n<20?2:0),u=4+(n>8&&n<18?9*Math.exp(-Math.pow(n-13,2)/12):0)+Math.sin(n/5),g=(220+n*4)%360;i.push([Number(l.toFixed(1)),Number(Math.max(0,u).toFixed(1)),Math.round(g)])}Te({base_epoch:t,age_s:480,count:48,hours:i}),Ot(6)}function Ot(e){let t=[];for(let o=0;o<e;o++){let r=Tt[Oe%Tt.length];t.push([Oe,r[0],r[1],r[2]]),Oe++}De(t,Oe)}function qr(){xe+=1,m(a.uptime,{value:Number(Date.now()/1e3)|0}),m(a.wifi,{value:-55-Math.round((1+Math.sin(xe/4))*6)});let e=0,t=0,o=0;for(let n=0;n<Z;n++){let l=n+1,u=!!M.enabled[n],g=M.temp[n],f=M.setpoint[n],x=u&&M.driversEnabled&&!M.manualMode&&g<f-.25;M.manualMode?M.valve[n]=Math.max(0,M.valve[n]):!u||!M.driversEnabled?M.valve[n]=Math.max(0,M.valve[n]-6):x?M.valve[n]=Math.min(100,M.valve[n]+7+l%3):M.valve[n]=Math.max(0,M.valve[n]-5);let _=x?.05+M.valve[n]/2200:-.03+M.valve[n]/3200;M.temp[n]=g+_+Math.sin((xe+l)/5)*.04,u&&M.valve[n]>0&&(e+=M.valve[n],t+=1,o=Math.max(o,M.valve[n])),m(d.temp(l),{value:M.temp[n]}),m(d.valve(l),{value:Math.round(M.valve[n])});let y=Math.max(0,(M.setpoint[n]-M.temp[n]-.15)*.22);m(d.preheatAdvance(l),{value:Number(y.toFixed(2))}),m(d.state(l),{state:u?x?"heating":"idle":"off"}),m(d.enabled(l),{value:u,state:u?"on":"off"}),m(d.probeTemp(l),{value:M.temp[n]+Math.sin((xe+l)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(xe/6)*.25,s=r-(t?2.1+e/Math.max(1,t*50):1.1);m(a.flow,{value:Number(r.toFixed(1))}),m(a.ret,{value:Number(s.toFixed(1))}),m(d.probeTemp(7),{value:Number((s-.4).toFixed(1))}),m(d.probeTemp(8),{value:Number((r+.2).toFixed(1))}),ze(!0);let i=T("zoneStateHistory");i&&(i.uptime_s=Number(Date.now()/1e3)|0),xe%3===0&&Ot(1)}function Pt(){Dt||(Pr(),ve(!0),Dt=setInterval(qr,1200))}function Pe(e){var i;let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=Z){let n=Number(o);Number.isNaN(n)||(M.setpoint[r-1]=n,m(d.setpoint(r),{value:n}),L("Zone "+r+" setpoint set to "+n.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=Z){let n=o>.5;M.enabled[r-1]=n?1:0,m(d.enabled(r),{value:n,state:n?"on":"off"}),L("Zone "+r+(n?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let n=o>.5;M.driversEnabled=n?1:0,m(a.drivers,{value:n,state:n?"on":"off"}),L(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=o>.5;M.manualMode=n?1:0,be("manualMode",n);return}if(t==="motor_target"&&r>=1&&r<=Z){let n=Number(o||0);m(d.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(n)))}),L("Motor "+r+" target set to "+n+"%",r);return}if(t==="command"){let n=String(o);if(n==="i2c_scan"){he(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),L("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){L("Command executed: "+n);return}if(n==="open_motor_timed"&&r>=1&&r<=Z){L("Motor "+r+" open timed",r);return}if(n==="close_motor_timed"&&r>=1&&r<=Z){L("Motor "+r+" close timed",r);return}if(n==="stop_motor"&&r>=1&&r<=Z){L("Motor "+r+" stopped",r);return}if(n==="motor_reset_fault"&&r>=1&&r<=Z){L("Motor "+r+" fault reset",r);return}if(n==="motor_reset_learned_factors"&&r>=1&&r<=Z){L("Motor "+r+" learned factors reset",r);return}if(n==="motor_reset_and_relearn"&&r>=1&&r<=Z){L("Motor "+r+" reset and relearn started",r);return}if(n==="dump_task_stats"){L("Task stats dumped to device log (mock)");return}if(n==="reset_balancing"){for(let l=1;l<=Z;l++)m(d.balanceAdapt(l),{value:1}),m(d.balanceFactor(l),{value:(i=z(d.staticFactor(l)))!=null?i:1}),m(d.adaptErr(l),{value:null});L("Adaptive balancing reset");return}return}if(t==="zone_probe"&&r>=1){m(d.probe(r),{state:String(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){m(d.tempSource(r),{state:String(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){m(d.syncTo(r),{state:String(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){m(d.pipeType(r),{state:String(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){m(a.manifoldType,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){m(a.manifoldFlowProbe,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){m(a.manifoldReturnProbe,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){m(a.motorProfileDefault,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){m(a.simplePreheatEnabled,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="balance_mode"){m(a.balanceMode,{state:String(o)}),L("Setting updated: "+t+" = "+o);return}if(t==="zone_ble_mac"&&r>=1){m(d.ble(r),{state:String(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){let n=String(o)||"None";m(d.exteriorWalls(r),{state:n});let l=n==="None"?0:n.split(",").filter(Boolean).length,u=[0,.5,.7,.85,1][Math.min(l,4)];m(d.windExposure(r),{value:u}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){m(d.area(r),{value:Number(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){m(d.spacing(r),{value:Number(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_wind_exposure"&&r>=1){m(d.windExposure(r),{value:Number(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_solar_gain"&&r>=1){m(d.solarGain(r),{value:Number(o)}),L("Setting updated: "+t+" = "+o,r);return}if(t==="zone_thermal_lead_h"&&r>=1){m(d.thermalLeadH(r),{value:Number(o)}),L("Setting updated: "+t+" = "+o,r);return}let s={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax,min_zone_flow_pct:a.minZoneFlowPct};if(s[t]){let n=Number(o);Number.isNaN(n)||(m(s[t],{value:n}),L("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){Pe({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!M.enabled[e-1];Pe({key:"zone_enabled",value:t?1:0,zone:e})}};var qe="/api/hv6/v1";function Re(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function X(e,t,o){if(kt(),Re())try{return Pe(o),Promise.resolve({ok:!0})}finally{ot()}let r=new URLSearchParams;for(let[n,l]of Object.entries(t||{}))l!=null&&r.append(n,l);let s=r.toString(),i=qe+e+(s?"?"+s:"");return fetch(i,{method:"POST"}).then(n=>(n.ok||console.warn(`API call failed: POST ${e} status=${n.status}`),n)).catch(n=>{throw console.error(`API call error: POST ${e}:`,n),n}).finally(()=>{ot()})}function at(e,t){return m(d.setpoint(e),{value:t}),X(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function qt(e,t){return m(d.enabled(e),{state:t?"on":"off",value:t}),X(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function He(e){return m(a.drivers,{state:e?"on":"off",value:e}),X("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function te(e,t){return X("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function Rt(){return he("Scanning I2C bus..."),L("I2C scan started"),te("i2c_scan")}var Rr={zone_probe:e=>d.probe(e),zone_temp_source:e=>d.tempSource(e),zone_sync_to:e=>d.syncTo(e),zone_pipe_type:e=>d.pipeType(e)},Hr={zone_ble_mac:e=>d.ble(e),zone_exterior_walls:e=>d.exteriorWalls(e)},Ir={zone_area_m2:e=>d.area(e),zone_pipe_spacing_mm:e=>d.spacing(e)},Br={manifold_type:a.manifoldType,manifold_flow_probe:a.manifoldFlowProbe,manifold_return_probe:a.manifoldReturnProbe,motor_profile_default:a.motorProfileDefault,simple_preheat_enabled:a.simplePreheatEnabled,balance_mode:a.balanceMode},Zr={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,adapt_interval_s:a.adaptIntervalS,adapt_step:a.adaptStep,adapt_min:a.adaptMin,adapt_max:a.adaptMax};function ye(e,t,o){let r=Rr[t];return r&&m(r(e),{state:o}),X("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function Ie(e,t,o){let r=Hr[t];return r&&m(r(e),{state:o}),X("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function we(e,t,o){let r=Number(o),s=Ir[t];return s&&!Number.isNaN(r)&&m(s(e),{value:r}),X("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function Y(e,t){let o=Br[e];return o&&m(o,{state:t}),X("/settings/select",{key:e,value:t},{key:e,value:t})}function J(e,t){let o=Number(t),r=Zr[e];return r&&!Number.isNaN(o)&&m(r,{value:o}),X("/settings/number",{key:e,value:o},{key:e,value:o})}function Ht(e,t){return X("/settings/text",{key:e,value:t},{key:e,value:t})}function It(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return m(d.motorTarget(e),{value:r}),L("Motor "+e+" target set to "+r+"%",e),X(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function Bt(e,t=1e4){return L("Motor "+e+" open for "+t+"ms",e),X(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function Zt(e,t=1e4){return L("Motor "+e+" close for "+t+"ms",e),X(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function nt(e){return L("Motor "+e+" stopped",e),X(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function st(e){return be("manualMode",!!e),L(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),X("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function Wt(e){return L("Motor "+e+" fault reset",e),te("motor_reset_fault",e)}function jt(e){return L("Motor "+e+" learned factors reset",e),te("motor_reset_learned_factors",e)}function Vt(e){return L("Motor "+e+" reset and relearn started",e),te("motor_reset_and_relearn",e)}function Gt(){return L("Adaptive balancing reset \u2014 learned factors back to 1.0"),te("reset_balancing")}function $t(){return L("Task stats dumped to device log"),te("dump_task_stats")}function it(){Re()||fetch(qe+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Ne(e)}).catch(()=>{})}function lt(){if(Re())return;let e=Ft();fetch(qe+"/logs?since="+e,{cache:"no-store"}).then(t=>t.ok?t.json():null).then(t=>{t&&De(t.lines,t.next_seq)}).catch(()=>{})}function dt(){Re()||fetch(qe+"/forecast",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Te(e)}).catch(()=>{})}var ct=null,Be=null,Ut=null,Xt=null,Yt=null;async function Wr(){Be&&Be.abort(),Be=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Be.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function Kt(e){if(!(!e||typeof e!="object")&&!Ct()){for(let t in e)m(t,e[t]);ze(!1)}}function jr(e){if(e){if(!e.type){Kt(e);return}if(e.type==="state"){Kt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;L(t),String(t).indexOf("I2C_SCAN:")!==-1&&he(String(t))}}}function Jt(){ct||(ct=setTimeout(()=>{ct=null,pt()},1e3))}function pt(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){Pt();return}Wr().then(t=>{ve(!0),jr(t),it(),Ut||(Ut=setInterval(it,300*1e3)),lt(),Xt||(Xt=setInterval(lt,3e3)),dt(),Yt||(Yt=setInterval(dt,300*1e3)),Jt()}).catch(()=>{ve(!1),Jt()})}var Qt=Object.create(null);function S(e,t){if(Qt[e])return;Qt[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}var Vr=`
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
`;S("ui-kit",Vr);function Gr(e,t){let o=Math.abs(Number(e));return!Number.isFinite(o)||o<1e3?t:Math.pow(10,Math.floor(Math.log10(o))-1)}function $r(e){let t=String(e),o=t.indexOf(".");return o<0?0:t.length-o-1}function G(e,t={}){let o=e.querySelector(t.title||".ui-card-title"),r=document.createElement("div");r.className="ui-form-banner",r.innerHTML='<span class="ui-form-banner-msg">Unsaved changes</span><span class="ui-form-banner-btns"><button type="button" class="ui-form-discard">Discard</button><button type="button" class="ui-form-apply">Apply</button></span>',o?o.insertAdjacentElement("afterend",r):e.insertAdjacentElement("afterbegin",r);let s=[],i=()=>r.classList.toggle("show",s.some(c=>c.dirty)),n=(c,p)=>{c.dirty=p,i()};function l(c){return c.markDirty=()=>n(c,!0),s.push(c),c}function u(c,p){let w={dirty:!1,input:c},A=p.baseStep!=null?p.baseStep:parseFloat(c.step)||1,O=$r(A),W=p.min!=null?p.min:c.min!==""?parseFloat(c.min):-1/0,P=p.max!=null?p.max:c.max!==""?parseFloat(c.max):1/0,F=C=>O>0?Number(C).toFixed(O):String(Math.round(Number(C)));if(!p.nostep){let C=document.createElement("div");C.className="ui-stepper",c.parentNode.insertBefore(C,c);let R=document.createElement("button");R.type="button",R.className="ui-step-btn",R.textContent="\u2212",R.tabIndex=-1,R.setAttribute("aria-label","decrease");let H=document.createElement("button");H.type="button",H.className="ui-step-btn",H.textContent="+",H.tabIndex=-1,H.setAttribute("aria-label","increase"),C.appendChild(R),C.appendChild(c),C.appendChild(H),c.readOnly=!0;let $=K=>{if(c.disabled)return;let I=parseFloat(c.value);Number.isFinite(I)||(I=parseFloat(c.placeholder)),Number.isFinite(I)||(I=0);let ce=Math.min(P,Math.max(W,I+K*Gr(I,A)));c.value=F(ce),n(w,!0)};R.addEventListener("click",()=>$(-1)),H.addEventListener("click",()=>$(1)),c.addEventListener("dblclick",()=>{c.disabled||(c.readOnly=!1,c.classList.add("editing"),c.focus(),c.select())}),c.addEventListener("blur",()=>{c.readOnly=!0,c.classList.remove("editing")}),c.addEventListener("keydown",K=>{K.key==="Enter"&&c.blur()})}return c.addEventListener("input",()=>n(w,!0)),w.sync=()=>{let C=p.read();c.value=C!=null&&Number.isFinite(Number(C))?F(C):""},w.commit=()=>{let C=parseFloat(c.value);Number.isFinite(C)&&p.commit(Math.min(P,Math.max(W,C)))},l(w)}function g(c,p){let w={dirty:!1,input:c};return c.addEventListener("input",()=>n(w,!0)),w.sync=()=>{let A=p.read();c.value=A!=null?A:""},w.commit=()=>p.commit(c.value.trim()),l(w)}function f(c,p){let w={dirty:!1,input:c};return c.addEventListener("change",()=>n(w,!0)),w.sync=()=>{let A=p.read();A!=null&&(c.value=A)},w.commit=()=>p.commit(c.value),l(w)}function x(c,p){let w={dirty:!1,input:c,staged:!1},A=c.closest(".ui-row"),O=()=>{c.classList.toggle("on",w.staged),A&&A.classList.toggle("is-on",w.staged),c.setAttribute("aria-checked",w.staged?"true":"false"),p.onChange&&p.onChange(w.staged)};return c.addEventListener("click",()=>{w.staged=!w.staged,n(w,!0),O()}),w.sync=()=>{w.staged=!!p.read(),O()},w.commit=()=>p.commit(w.staged),l(w)}function _(c){let p={dirty:!1,sync:c.sync,commit:c.commit};return l(p)}let y=()=>s.forEach(c=>{!c.dirty&&c.sync&&c.sync()}),h=()=>{s.forEach(c=>{c.dirty&&(c.commit&&c.commit(),c.dirty=!1)}),i(),t.onApply&&t.onApply()},v=()=>{s.forEach(c=>{c.dirty=!1,c.sync&&c.sync()}),i(),t.onDiscard&&t.onDiscard()};return r.querySelector(".ui-form-apply").addEventListener("click",h),r.querySelector(".ui-form-discard").addEventListener("click",v),{num:u,text:g,select:f,toggle:x,custom:_,refresh:y,apply:h,discard:v,isDirty:()=>s.some(c=>c.dirty)}}function Q(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function Ze(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function We(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function er(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var Ur=`
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
  background: linear-gradient(180deg, rgba(0,63,92,.54), rgba(0,32,46,.46));
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
  background: linear-gradient(180deg, rgba(0,84,120,.64), rgba(0,63,92,.54));
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
  background: linear-gradient(180deg, rgba(0,63,92,.52), rgba(0,32,46,.42));
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
  border-color: rgba(255,133,49,.35);
  background: linear-gradient(180deg, rgba(83,56,20,.46), rgba(58,37,12,.36));
}

.meta-chip-state.offline {
  color: var(--text-secondary);
  border-color: rgba(120,146,200,.24);
  background: linear-gradient(180deg, rgba(0,63,92,.34), rgba(0,32,46,.28));
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
  /* Stat pills (uptime / wifi / asgard) ride to the very top, above brand + menu. */
  .top-meta { order: -2; justify-items: center; }
  .top-brand { order: -1; justify-self: center; justify-content: center; flex-wrap: wrap; }
  .brand-row { justify-content: center; }
  .brand-fw { text-align: center; width: 100%; }
  .meta-row { justify-content: center; flex-wrap: wrap; }
  .top-menu { justify-content: center; }
}
`;S("hv6-header",Ur);var Xr=()=>`
  <header class="topbar">
    <div class="topbar-head">
      <nav class="top-menu">
        <a href="#" class="menu-link active" data-section="overview">Monitor</a>
        <a href="#" class="menu-link" data-section="zones">Zones</a>
        <a href="#" class="menu-link" data-section="settings">Settings</a>
        <a href="#" class="menu-link" data-section="logs">Logs</a>
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
          <span class="meta-chip"><span class="meta-chip-label">Uptime</span><span class="meta-chip-value" id="hdr-up">---</span></span>
          <span class="meta-chip"><span class="meta-chip-label">WiFi</span><span class="meta-chip-value" id="hdr-wifi">---</span></span>
          <span class="meta-chip" id="hdr-asgard" hidden><span class="meta-chip-label">Asgard</span><span class="meta-chip-value" id="hdr-asgard-val">---</span></span>
        </div>
      </div>
    </div>
  </header>
`,Sn=k({tag:"hv6-header",render:Xr,onMount(e,t){let o=t.querySelector("#hdr-dot"),r=t.querySelector("#hdr-sync"),s=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),n=t.querySelector("#hdr-asgard"),l=t.querySelector("#hdr-asgard-val"),u=t.querySelector("#hdr-fw"),g=t.querySelectorAll(".menu-link");function f(){let _=T("section");g.forEach(y=>{y.classList.toggle("active",y.getAttribute("data-section")===_)})}function x(){let _=T("live"),y=T("pendingWrites"),h=!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock);o.classList.toggle("on",!!_);let v,c;y>0?(v="Saving\u2026",c="saving"):h?(v=window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock",c="synced"):_?(v="Live",c="synced"):(v="Offline",c="offline"),r.textContent=v,r.className="meta-chip meta-chip-state "+c,s.textContent=We(z(a.uptime)),i.textContent=er(z(a.wifi));let p=z(a.asgardLastPushC),w=B(a.asgardEnabled)&&p!=null&&Number.isFinite(p);n.hidden=!w,w&&(l.textContent=p.toFixed(2)+"\xB0C");let A=T("firmwareVersion")||E(a.firmware);u.textContent=A?"FW "+A:""}g.forEach(_=>{_.addEventListener("click",y=>{y.preventDefault(),zt(_.getAttribute("data-section"))})}),D("section",f),D("live",x),D("pendingWrites",x),D("firmwareVersion",x),b(a.uptime,x),b(a.wifi,x),b(a.asgardLastPushC,x),b(a.asgardEnabled,x),b(a.firmware,x),f(),x()}});var Yr=`
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
`;S("status-card",Yr);var Kr=e=>`
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
`,An=k({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:Kr,methods:{update(e){this.motorDriversOn=B(a.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=B(a.fault)?"FAULT":"OK",this.connOn=T("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let o={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},r=()=>e.update(o);b(a.drivers,r),b(a.fault,r),D("live",r),o.sw.onclick=()=>{He(!e.motorDriversOn)},r()}});var Jr=`
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
`;S("connectivity-card",Jr);var Qr=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Rn=k({tag:"connectivity-card",render:Qr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),s=t.querySelector(".cc-mac"),i=t.querySelector(".cc-up");function n(){o.textContent=E(a.ip)||"---",r.textContent=E(a.ssid)||"---",s.textContent=E(a.mac)||"---",i.textContent=We(z(a.uptime))}b(a.ip,n),b(a.ssid,n),b(a.mac,n),b(a.uptime,n),n()}});var eo="http://www.w3.org/2000/svg",gt=480,je=200,re=14,to=16,ro=34,ne=44,ft=gt-ne-to,ue=je-re-ro,or=24*3600,oo=U+2,ao=U+3,no=U+4,so=`
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
  height: auto;
  flex: 1;
  display: block;
  border-radius: 10px;
  background: linear-gradient(180deg, rgba(138,80,143,.12), rgba(0,32,46,.4));
}

.graph-axis,
.graph-grid {
  vector-effect: non-scaling-stroke;
}

.graph-tick-label {
  fill: var(--chart-axis);
  font-size: 11px;
  letter-spacing: .4px;
}

.graph-axis-label {
  fill: var(--chart-axis);
  font-size: 9px;
  letter-spacing: .8px;
  text-transform: uppercase;
  opacity: .85;
}

.graph-empty {
  fill: var(--text-faint);
  font-size: 12px;
  letter-spacing: .3px;
}
`;S("graph-widgets",so);var io=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-warm)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-cool)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-warm)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--series-cool)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function se(e,t,o){let r=document.createElementNS(eo,e);return t&&Object.keys(t).forEach(s=>{r.setAttribute(s,t[s])}),o!=null&&(r.textContent=o),r}function lo(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"C":"---"}function ut(e,t,o){let r=[];for(let s=0;s<e.length;s++){let i=e[s];if(!i||i[0]<o)continue;let n=i[t];n==null||!Number.isFinite(n)||r.push({t:i[0],v:n})}return r}function Ve(e,t){let o=(e-t)/or;return ne+Math.max(0,Math.min(1,o))*ft}function ar(e,t,o,r){if(!e.length)return"";let s=Math.max(.001,r-o),i="";for(let n=0;n<e.length;n++){let l=Ve(e[n].t,t),u=re+(1-(e[n].v-o)/s)*ue;i+=(n?" L ":"M ")+l.toFixed(2)+" "+u.toFixed(2)}return i}function co(e,t,o,r){let s=ar(e,t,o,r);if(!s)return"";let i=(re+ue).toFixed(2),n=Ve(e[e.length-1].t,t).toFixed(2),l=Ve(e[0].t,t).toFixed(2);return s+" L "+n+" "+i+" L "+l+" "+i+" Z"}function po(e,t,o){let r=[];if(e.forEach(l=>r.push(l.v)),t&&t.forEach(l=>r.push(l.v)),!r.length)return o==="%"?{min:0,max:100}:{min:0,max:10};let s=Math.min.apply(null,r),i=Math.max.apply(null,r);if(o==="%"&&(s=0,i=Math.min(100,i)),s===i){let l=o==="%"?5:.5;s-=l,i+=l}let n=(i-s)*.08;return o!=="%"&&(s-=n),i+=n,o==="%"&&(s=Math.max(0,s),i=Math.min(100,i)),{min:s,max:i}}function uo(e,t,o,r,s,i){let n="rgba(150,168,205,0.40)",l="rgba(150,168,205,0.16)",g=[24,12,0];e.appendChild(se("line",{x1:ne,y1:re,x2:ne,y2:re+ue,stroke:n,"stroke-width":"1",class:"graph-axis"})),e.appendChild(se("line",{x1:ne,y1:re+ue,x2:ne+ft,y2:re+ue,stroke:n,"stroke-width":"1",class:"graph-axis"}));for(let f=0;f<3;f++){let x=f/2,_=re+x*ue,y=o-(o-t)*x;e.appendChild(se("line",{x1:ne,y1:_,x2:ne+ft,y2:_,stroke:l,"stroke-width":"1",class:"graph-grid"})),e.appendChild(se("text",{x:ne-6,y:_+4,"text-anchor":"end",class:"graph-tick-label"},lo(y,r)))}g.forEach(f=>{let x=Ve(i-f*3600,s);e.appendChild(se("text",{x,y:je-10,"text-anchor":f===24?"start":f===0?"end":"middle",class:"graph-tick-label"},f===0?"now":"-"+f+"h"))}),e.appendChild(se("text",{x:8,y:re+ue/2,transform:"rotate(-90 8 "+(re+ue/2).toFixed(2)+")","text-anchor":"middle",class:"graph-axis-label"},r==="%"?"Demand":"Temp"))}function tr(e,t,o,r,s,i,n,l){let u=ar(t,o,r,s);if(u){if(l){let g=se("path",{d:co(t,o,r,s),fill:l,stroke:"none"});e.appendChild(g)}e.appendChild(se("path",{d:u,fill:"none",stroke:i,"stroke-width":String(n),"stroke-linecap":"round","stroke-linejoin":"round"}))}}function rr(e,t,o,r,s,i,n,l,u){if(e.innerHTML="",e.setAttribute("viewBox","0 0 "+gt+" "+je),e.setAttribute("preserveAspectRatio","xMidYMid meet"),!t.length&&!(r&&r.length)){e.appendChild(se("text",{x:gt/2,y:je/2,"text-anchor":"middle",class:"graph-empty"},"Collecting history\u2026"));return}let g=po(t,r,i);uo(e,g.min,g.max,i,n,l),tr(e,t,n,g.min,g.max,o,2.4,u),r&&r.length&&tr(e,r,n,g.min,g.max,s,2)}var mo="var(--series-warm)",go="var(--series-cool)",fo="var(--series-cool)";function mt(e){return e.length?e[e.length-1].v:null}var Wn=k({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:io,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),s=t.querySelector(".gw-flow"),i=t.querySelector(".gw-demand");function n(){let l=T("zoneStateHistory"),u=l&&Array.isArray(l.entries)?l.entries:[],g=l&&l.uptime_s||Number(Date.now()/1e3)|0,f=g-or,x=ut(u,oo,f),_=ut(u,ao,f),y=ut(u,no,f);if(o&&s){let h=mt(x),v=mt(_);o.textContent=h!=null&&v!=null?(h-v).toFixed(1)+" C":"---",rr(s,x,mo,_,go,"C",f,g)}if(r&&i){let h=mt(y);r.textContent=h!=null?Math.round(h)+"%":"---",rr(i,y,fo,null,null,"%",f,g,"var(--series-cool-fill)")}}D("zoneStateHistory",n),n()}});var me={0:{label:"Off",color:"#2c4875"},1:{label:"Manual",color:"#d07bb5"},2:{label:"Calibrating",color:"#ffd380"},3:{label:"Wait Cal.",color:"#6B5C84"},4:{label:"Wait Temp",color:"#6B5C84"},5:{label:"Heating",color:"#ff8531"},6:{label:"Idle",color:"#39354c"},7:{label:"Overheated",color:"#ff6361"},255:{label:"",color:"transparent"}},nr=24*3600,Se=18,vt=4,fe=54,$e=20,ke=4,Ue=10,ir=6,lr="#bc5090",sr=U+1,dr=ke+U*(Se+vt)-vt,bt=dr+ir,Ge=dr+ir+Ue+$e,bo=`
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
`;S("zone-state-timeline",bo);var vo=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function ho(e,t){if(!e||!e.entries||e.entries.length===0)return null;let o=e.entries,r=e.uptime_s||t||0,s=r-nr,i=1e3,n=i-fe;function l(h){let v=(h-s)/nr;return fe+Math.max(0,Math.min(1,v))*n}let u="http://www.w3.org/2000/svg",g=document.createElementNS(u,"svg");g.setAttribute("viewBox","0 0 "+i+" "+Ge),g.classList.add("timeline-svg");let f=document.createElementNS(u,"rect");f.setAttribute("x",fe),f.setAttribute("y",ke),f.setAttribute("width",n),f.setAttribute("height",Ge-ke-$e),f.setAttribute("fill","rgba(0,32,46,0.55)"),f.setAttribute("rx","4"),g.appendChild(f);let x=[6,12,18,24];for(let h of x){let v=r-h*3600,c=l(v),p=document.createElementNS(u,"line");p.setAttribute("x1",c),p.setAttribute("y1",ke),p.setAttribute("x2",c),p.setAttribute("y2",Ge-$e),p.setAttribute("stroke","rgba(120,146,200,.16)"),p.setAttribute("stroke-width","1"),g.appendChild(p)}for(let h=0;h<U;h++){let v=ke+h*(Se+vt),c=document.createElementNS(u,"rect");c.setAttribute("x",fe),c.setAttribute("y",v),c.setAttribute("width",n),c.setAttribute("height",Se),c.setAttribute("fill",h%2===0?"rgba(124,155,208,0.05)":"rgba(124,155,208,0.00)"),g.appendChild(c);let p=document.createElementNS(u,"text");p.setAttribute("x",fe-4),p.setAttribute("y",v+Se/2+1),p.setAttribute("text-anchor","end"),p.setAttribute("dominant-baseline","middle"),p.setAttribute("fill","rgba(233,222,210,.62)"),p.setAttribute("font-size","9.5"),p.setAttribute("font-family","Montserrat, sans-serif"),p.setAttribute("font-weight","600"),p.textContent="Z"+(h+1),g.appendChild(p);let w=o.filter(P=>P[0]>=s).map(P=>({t:P[0],state:P[h+1]}));if(w.length===0)continue;let A=w[0].t,O=w[0].state,W=(P,F,C)=>{if(C===255)return;let R=me[C]||me[255];if(R.color==="transparent")return;let H=l(P),$=l(F),K=Math.max(1,$-H),I=document.createElementNS(u,"rect");I.setAttribute("x",H),I.setAttribute("y",v+1),I.setAttribute("width",K),I.setAttribute("height",Se-2),I.setAttribute("fill",R.color),I.setAttribute("rx","2"),I.setAttribute("opacity","0.88"),g.appendChild(I)};for(let P=1;P<w.length;P++){let F=w[P];F.state!==O&&(W(A,F.t,O),A=F.t,O=F.state)}W(A,r,O)}{let h=document.createElementNS(u,"rect");h.setAttribute("x",fe),h.setAttribute("y",bt),h.setAttribute("width",n),h.setAttribute("height",Ue),h.setAttribute("fill","rgba(188,80,144,0.10)"),h.setAttribute("rx","2"),g.appendChild(h);let v=document.createElementNS(u,"text");v.setAttribute("x",fe-4),v.setAttribute("y",bt+Ue/2+1),v.setAttribute("text-anchor","end"),v.setAttribute("dominant-baseline","middle"),v.setAttribute("fill","rgba(233,222,210,.62)"),v.setAttribute("font-size","8.5"),v.setAttribute("font-family","Montserrat, sans-serif"),v.setAttribute("font-weight","600"),v.textContent="Absorb",g.appendChild(v);let c=o.filter(p=>p[0]>=s).map(p=>({t:p[0],on:p.length>sr?p[sr]:0}));if(c.length){let p=(O,W)=>{let P=l(O),F=Math.max(1,l(W)-P),C=document.createElementNS(u,"rect");C.setAttribute("x",P),C.setAttribute("y",bt),C.setAttribute("width",F),C.setAttribute("height",Ue),C.setAttribute("fill",lr),C.setAttribute("rx","2"),C.setAttribute("opacity","0.9"),g.appendChild(C)},w=c[0].t,A=c[0].on;for(let O=1;O<c.length;O++)c[O].on!==A&&(A&&p(w,c[O].t),w=c[O].t,A=c[O].on);A&&p(w,r)}}let _=Ge-$e+14,y=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let h of y){let v=r-h.hoursAgo*3600,c=l(v),p=document.createElementNS(u,"text");p.setAttribute("x",c),p.setAttribute("y",_),p.setAttribute("text-anchor",h.hoursAgo===0?"end":"middle"),p.setAttribute("fill","rgba(202,219,248,.78)"),p.setAttribute("font-size","9"),p.setAttribute("font-family","Montserrat, sans-serif"),p.textContent=h.label,g.appendChild(p)}return g}function xo(e){e.innerHTML="";let t=[{code:5,...me[5]},{code:6,...me[6]},{code:0,...me[0]},{code:1,...me[1]},{code:7,...me[7]},{code:2,...me[2]}];for(let r of t){let s=document.createElement("div");s.className="tl-legend-item",s.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(s)}let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+lr+'"></span>Preheat absorption',e.appendChild(o)}var Xn=k({tag:"zone-state-timeline",render:vo,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");xo(r);function s(){let i=T("zoneStateHistory"),n=(()=>{let u=T&&T("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!i||!i.entries||i.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent="No history yet \u2014 data accumulates every 5 minutes.",o.appendChild(u);return}let l=ho(i,n);l&&o.appendChild(l)}D("zoneStateHistory",s),D("zoneNames",s),s()}});var yo=`
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
`;S("zone-grid",yo);var wo=()=>'<div class="zone-grid"></div>',Qn=k({tag:"zone-grid",render:wo,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(q("zone-card",{zone:o}))}});var _o=`
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
	background: linear-gradient(180deg, rgba(28,58,103,.52), rgba(18,39,72,.46));
}
.zone-card.active {
	border-color: rgba(255,133,49,.44);
	border-left-color: rgba(255,133,49,.84);
	background: linear-gradient(180deg, rgba(255,133,49,.12), rgba(255,133,49,.04));
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
`;S("zone-card",_o);var zo=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${ee(e.zone)}</div>
		<div class="zc-friendly">${pe(e.zone)||"---"}</div>
	</div>
`,ss=k({tag:"zone-card",state:e=>({zone:e.zone}),render:zo,onMount(e,t){let o=e.zone,r=d.temp(o),s=d.state(o),i=d.enabled(o),n=t.querySelector(".zc-state-label"),l=t.querySelector(".zc-dot"),u=t.querySelector(".zc-zone-name"),g=t.querySelector(".zc-friendly");function f(){let x=B(i),_=String(E(s)||"").toUpperCase()||"OFF",y=String(E(d.motorLastFault(o))||"").toUpperCase(),h=y&&y!=="NONE"&&y!=="OK",v=x&&(_==="FAULT"||h)?"FAULT":_,c=T("selectedZone")===o,p=pe(o);u.textContent=ee(o),g.textContent=p||Q(z(r)),n.textContent=x?v:"OFF",t.title=h?"Fault: "+y:"";let w=x?v:"OFF",A=w==="HEATING"?"#ffd380":w==="IDLE"?"#79d17e":w==="FAULT"?"#ff6361":"#6E7E96",O=w==="HEATING"?"#ff8531":w==="IDLE"?"#79d17e":w==="FAULT"?"#ff6361":"rgba(120,146,200,.35)";n.style.color=A,l.style.background=O,l.style.boxShadow=w==="HEATING"?"0 0 5px rgba(255,133,49,.6)":w==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",c),t.classList.toggle("disabled",!x),t.classList.toggle("zs-heating",x&&w==="HEATING"),t.classList.toggle("zs-fault",x&&w==="FAULT"),t.classList.toggle("zs-idle",x&&w!=="HEATING"&&w!=="FAULT"),t.classList.toggle("zs-off",!x)}t.addEventListener("click",()=>{St(o)}),b(r,f),b(s,f),b(i,f),b(d.motorLastFault(o),f),D("selectedZone",f),D("zoneNames",f),f()}});var So=`
.zone-detail {
  background: linear-gradient(180deg, rgba(0,63,92,.30), rgba(0,32,46,.24));
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
`;S("zone-detail",So);var ko=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${ee(e.zone)}</div>
      <div class="zd-head-ctrl">
        <div class="ui-toggle btn-toggle" role="switch" aria-label="Zone enabled" title="Zone enabled"></div>
        <span class="zd-badge">---</span>
      </div>
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
`;function cr(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function pr(e){return e!=null?Number(e).toFixed(0):"---"}function Co(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var gs=k({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:ko,methods:{update(e,t){let o=T("selectedZone"),r=String(E(d.state(o))||"").toUpperCase(),s=B(d.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=ee(o),t.setpoint.textContent=Q(z(d.setpoint(o))),t.temp.textContent=Q(z(d.temp(o))),t.ret.textContent=Q(z("sensor-manifold_return_temperature")),t.valve.textContent=Ze(z(d.valve(o)));let i=t.badge;i.textContent=s?r||"IDLE":"DISABLED";let n=s?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";i.className="zd-badge"+(n?" "+n:""),t.toggle.classList.toggle("on",s),t.orip.textContent=pr(z(d.motorOpenRipples(o))),t.crip.textContent=pr(z(d.motorCloseRipples(o))),t.ofac.textContent=cr(z(d.motorOpenFactor(o))),t.cfac.textContent=cr(z(d.motorCloseFactor(o))),t.ph.textContent=Co(z(d.preheatAdvance(o)));let l=String(E(d.motorLastFault(o))||"").toUpperCase(),u=l&&l!=="NONE"&&l!=="OK";t.fault.hidden=!u,u&&(t.faultVal.textContent=l)},incSetpoint(){let e=this.zone,t=z(d.setpoint(e))||20;at(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=z(d.setpoint(e))||20;at(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=B(d.enabled(e));qt(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec"),orip:t.querySelector(".zd-orip"),crip:t.querySelector(".zd-crip"),ofac:t.querySelector(".zd-ofac"),cfac:t.querySelector(".zd-cfac"),ph:t.querySelector(".zd-ph"),fault:t.querySelector(".zd-fault"),faultVal:t.querySelector(".zd-fault-val")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),s=i=>{let n=T("selectedZone");(i===d.temp(n)||i===d.setpoint(n)||i===d.valve(n)||i===d.state(n)||i===d.enabled(n))&&r()};for(let i=1;i<=6;i++)b(d.temp(i),s),b(d.setpoint(i),s),b(d.valve(i),s),b(d.state(i),s),b(d.enabled(i),s),b(d.motorOpenRipples(i),r),b(d.motorCloseRipples(i),r),b(d.motorOpenFactor(i),r),b(d.motorCloseFactor(i),r),b(d.preheatAdvance(i),r),b(d.motorLastFault(i),r);b("sensor-manifold_return_temperature",r),D("selectedZone",r),r()}});var Eo=`
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
`;S("zone-sensor-card",Eo);var Lo=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
        <span class="ui-label">Merge With Zone <span class="ui-sublabel">merge into one room \u2014 mean temperature, valves open equally</span></span>
        <span class="ui-field"><select class="ui-select zs-sync"></select></span>
      </div>
    </div>
  `};function Fo(e,t){let o=e.value,r="<option>None</option>";for(let s=1;s<=6;s++)s!==t&&(r+="<option>Zone "+s+"</option>");e.innerHTML=r,e.value=o||"None"}function Mo(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Ao(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function No(e,t){let o="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}var _s=k({tag:"zone-sensor-card",render:Lo,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),s=t.querySelector(".zs-ble"),i=t.querySelector(".zs-sync"),n=t.querySelector(".zs-row-ble"),l=t.querySelector(".zs-scan"),u=t.querySelector(".zs-scan-list"),g=0;function f(){return T("selectedZone")}function x(){n.style.display=r.value==="BLE Sensor"?"":"none"}let _=G(t);No(r,"Local Probe"),_.select(o,{read:()=>E(d.probe(f()))||void 0,commit:c=>ye(f(),"zone_probe",c)}),_.select(r,{read:()=>Mo(String(E(d.tempSource(f()))||"")),commit:c=>ye(f(),"zone_temp_source",Ao(c))}),_.select(i,{read:()=>E(d.syncTo(f()))||"None",commit:c=>ye(f(),"zone_sync_to",c)});let y=_.text(s,{read:()=>E(d.ble(f()))||"",commit:c=>Ie(f(),"zone_ble_mac",c)});r.addEventListener("change",x);function h(){let c=f();g!==c?(Fo(i,c),g=c,u.style.display="none",_.discard()):_.refresh(),x()}function v(c){let p=f();(c===d.probe(p)||c===d.tempSource(p)||c===d.syncTo(p)||c===d.ble(p))&&(_.refresh(),x())}l.addEventListener("click",()=>{if(l.disabled)return;l.disabled=!0,l.textContent="\u2026",u.style.display="",u.innerHTML='<div class="scan-msg">Scanning\u2026</div>';let c=new AbortController,p=setTimeout(()=>c.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:c.signal}).then(w=>{if(!w.ok)throw new Error("HTTP "+w.status);return w.json()}).then(w=>{if(clearTimeout(p),l.disabled=!1,l.textContent="Scan",!w.ok||!w.sensors||w.sensors.length===0){u.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let A=f(),O=(E(d.ble(A))||"").toUpperCase(),W=F=>String(F).replace(/[&<>"']/g,C=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[C]),P="";for(let F of w.sensors){let C=F.mac.toUpperCase(),R=F.name?W(F.name):"",H=F.temp_c!=null?F.temp_c.toFixed(1)+"\xB0C":"\u2014",$=F.rssi!=null?F.rssi+" dBm":"",K=F.age_s<60?F.age_s+"s ago":Math.round(F.age_s/60)+"m ago",I="";C===O?I='<span class="ble-badge">assigned to this zone</span>':F.zone>0&&(I='<span class="ble-badge">zone '+F.zone+"</span>");let ce=R?`<div class="ble-mac">${R}</div><div class="ble-meta">${C}</div>`:`<div class="ble-mac">${C}</div>`;P+=`<div class="ble-scan-item">
              <div>
                ${ce}
                <div class="ble-meta">${H} &nbsp;${$} &nbsp;${K}</div>
                ${I}
              </div>
              <button class="btn-assign" data-mac="${C}">Assign</button>
            </div>`}u.innerHTML=P,u.querySelectorAll(".btn-assign").forEach(F=>{F.addEventListener("click",()=>{s.value=F.dataset.mac,y.markDirty(),u.style.display="none"})})}).catch(w=>{clearTimeout(p),l.disabled=!1,l.textContent="Scan";let A=w&&w.name==="AbortError"?"Scan timed out \u2014 device busy or BLE not responding. Try again.":"Scan failed. Check device connectivity.";u.innerHTML='<div class="scan-msg">'+A+"</div>"})}),D("selectedZone",h);for(let c=1;c<=6;c++)b(d.probe(c),v),b(d.tempSource(c),v),b(d.syncTo(c),v),b(d.ble(c),v);h()}});var Do=[0,.5,.7,.85,1];function To(e){return Do[Math.min(e,4)]}var Oo=`
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
  box-shadow: 0 0 0 1px rgba(124,155,208,.2);
}

.zone-room-card .wall-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
`;S("zone-room-card",Oo);var Po=()=>`
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
`,Ms=k({tag:"zone-room-card",render:Po,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),s=t.querySelector(".zr-spacing"),i=t.querySelector(".zr-pipe"),n=t.querySelector(".wall-btn-group").querySelectorAll(".wall-btn"),l=t.querySelector(".zr-wind"),u=t.querySelector(".zr-solar"),g=t.querySelector(".zr-lead");function f(){return T("selectedZone")}let x=G(t);x.text(o,{read:()=>pe(f())||"",commit:p=>Et(f(),p)}),x.num(r,{read:()=>z(d.area(f())),commit:p=>we(f(),"zone_area_m2",p)}),x.num(s,{read:()=>z(d.spacing(f())),commit:p=>we(f(),"zone_pipe_spacing_mm",p||200)}),x.select(i,{read:()=>E(d.pipeType(f()))||"Unknown",commit:p=>ye(f(),"zone_pipe_type",p)});let _=x.num(l,{read:()=>z(d.windExposure(f())),commit:p=>we(f(),"zone_wind_exposure",p)});x.num(u,{read:()=>z(d.solarGain(f())),commit:p=>we(f(),"zone_solar_gain",p)}),x.num(g,{read:()=>z(d.thermalLeadH(f())),commit:p=>we(f(),"zone_thermal_lead_h",p)});let y=[];function h(){n.forEach(p=>{let w=p.dataset.wall;p.classList.toggle("active",w==="None"?y.length===0:y.includes(w))})}let v=x.custom({sync:()=>{let p=E(d.exteriorWalls(f()))||"None";y=p==="None"?[]:p.split(",").filter(Boolean),h()},commit:()=>Ie(f(),"zone_exterior_walls",y.length?y.join(","):"None")});n.forEach(p=>{p.addEventListener("click",()=>{let w=p.dataset.wall,A=y.slice();if(w==="None")A=[];else{let O=A.indexOf(w);O>=0?A.splice(O,1):A.push(w)}y=["N","S","E","W"].filter(O=>A.includes(O)),h(),v.markDirty(),l.value=String(To(y.length)),_.markDirty()})});function c(p){let w=f();(p===d.area(w)||p===d.spacing(w)||p===d.pipeType(w)||p===d.exteriorWalls(w)||p===d.windExposure(w)||p===d.solarGain(w)||p===d.thermalLeadH(w))&&x.refresh()}D("selectedZone",x.discard),D("zoneNames",x.refresh);for(let p=1;p<=6;p++)b(d.area(p),c),b(d.spacing(p),c),b(d.pipeType(p),c),b(d.exteriorWalls(p),c),b(d.windExposure(p),c),b(d.solarGain(p),c),b(d.thermalLeadH(p),c);x.refresh()}});var qo=`
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
  stroke: #8a508f;
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
`;S("flow-diagram",qo);var ie=6,br=[60,126,192,258,324,390],Ke=225,_e=36,Ee=160,Xe=90,Ce=_e+Ee,le=640,Ro=11,ht=6,xt=24,Le=le+20,ur=le+200,mr=le+300,gr=le+372,vr="#6E7E96",hr="#5C6B85",Ho="#8a508f",Io="#BC5090",Bo="#FF8531",Zo="#FFA600",Wo="#8a508f",jo="#FFEAD2",Vo="#6E7E96",fr="#C7B6CE",yt="#5C6B85",Ye="#A38FB0",Go="#9A86A8",$o="#8a508f",Uo="#66BB6A",Xo="#FF6361";function Je(e,t,o){var r=Ke+(e-2.5)*Ro,s=br[e],i=le-Ce,n=Ce+i*.33,l=Ce+i*.67;return"M"+Ce+" "+(r-t).toFixed(1)+" C"+n+" "+(r-t).toFixed(1)+" "+l+" "+(s-o).toFixed(1)+" "+le+" "+(s-o).toFixed(1)+" L"+le+" "+(s+o).toFixed(1)+" C"+l+" "+(s+o).toFixed(1)+" "+n+" "+(r+t).toFixed(1)+" "+Ce+" "+(r+t).toFixed(1)+"Z"}function Yo(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function Ko(e){let t=String(pe(e)||"").trim();if(!t)return"";let o=t.toUpperCase();return o.length>18?o.slice(0,17)+"\u2026":o}function Jo(e,t){return t?e==null||Number.isNaN(e)?hr:e<.15?Ho:e<.4?Io:e<.7?Bo:Zo:vr}function Qo(){var e=1160,t=460,o=Ke-Xe/2,r=[];r.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),r.push("<defs>"),r.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),r.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(122,167,206,0.2)"/><stop offset="48%" stop-color="rgba(240,121,91,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),r.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#9E4A18"/><stop offset="100%" stop-color="#ff8531"/></linearGradient>');for(var s=1;s<=ie;s++)r.push('<linearGradient id="rg'+s+'" x1="0" y1="0" x2="1" y2="0">'),r.push('<stop id="rgs'+s+'" offset="0%" stop-color="#ff8531"/>'),r.push('<stop id="rga'+s+'" offset="100%" stop-color="#8a508f"/>'),r.push("</linearGradient>");r.push("</defs>"),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#042a3b"/>'),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var i=1;i<=ie;i++){var n=Je(i-1,ht,xt);r.push('<path d="'+n+'" fill="#062a3a" opacity="0.9"/>')}for(i=1;i<=ie;i++){var l=Je(i-1,ht,xt);r.push('<path id="fd-path-'+i+'" d="'+l+'" fill="url(#rg'+i+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}r.push('<line x1="'+le+'" y1="36" x2="'+le+'" y2="'+(t-36)+'" stroke="#ff8531" stroke-width="3" opacity="0.55"/>');var u=5,g=_e-u;for(r.push('<rect x="0" y="'+o+'" width="'+g+'" height="'+Xe+'" fill="url(#lbgrad)" rx="4"/>'),r.push('<rect x="'+_e+'" y="'+o+'" width="'+Ee+'" height="'+Xe+'" rx="6" fill="#ff8531"/>'),r.push('<text x="'+(_e+Ee/2)+'" y="'+(Ke-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#00202e" letter-spacing="2">FLOW</text>'),r.push('<text id="fd-flow-temp" x="'+(_e+Ee/2)+'" y="'+(Ke+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#00202e" font-family="var(--mono)">---</text>'),r.push('<text id="fd-ret-temp" x="'+(_e+Ee/2)+'" y="'+(o+Xe+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#8a508f" font-family="var(--mono)">RET ---</text>'),r.push('<text x="'+Le+'" y="34" font-size="11" fill="'+Ye+'" font-weight="700" letter-spacing="2">ZONE</text>'),r.push('<text x="'+ur+'" y="34" font-size="11" fill="'+Ye+'" font-weight="700" letter-spacing="2">TEMP</text>'),r.push('<text x="'+mr+'" y="34" font-size="11" fill="'+Ye+'" font-weight="700" letter-spacing="2">FLOW</text>'),r.push('<text x="'+gr+'" y="34" font-size="11" fill="'+Ye+'" font-weight="700" letter-spacing="2">RET</text>'),i=1;i<=ie;i++){var f=br[i-1];r.push('<text id="fd-zn'+i+'" x="'+Le+'" y="'+(f+2)+'" font-size="14" fill="#FFEAD2" font-weight="700" letter-spacing="2">ZONE '+i+"</text>"),r.push('<text id="fd-zf'+i+'" x="'+Le+'" y="'+(f+18)+'" font-size="11" fill="#B6A6C0" font-weight="700" letter-spacing="1">---</text>'),r.push('<text id="fd-zsp'+i+'" x="'+(Le+82)+'" y="'+(f+18)+'" font-size="11" fill="'+yt+'" font-weight="600" font-family="var(--mono)"></text>'),r.push('<text id="fd-zt'+i+'" x="'+ur+'" y="'+(f+10)+'" font-size="16" fill="#F6ECE0" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),r.push('<text id="fd-zv'+i+'" x="'+mr+'" y="'+(f+10)+'" font-size="16" fill="#C7B7D0" font-weight="700" font-family="var(--mono)">---%</text>'),r.push('<text id="fd-zr'+i+'" x="'+gr+'" y="'+(f+10)+'" font-size="16" fill="#C7B7D0" font-weight="700" font-family="var(--mono)">---</text>')}return r.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Go+'" letter-spacing="3">\u0394T Flow-Return</text>'),r.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#ff8531" font-family="var(--mono)">---</text>'),r.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#0C3A52" font-weight="700" letter-spacing="6">UFH - '+ie+" ZONES - HEATVALVE</text>"),r.push("</svg>"),'<div class="flow-wrap">'+r.join("")+"</div>"}var ea=()=>`<div class="flow-wrap">${Qo()}</div>`;k({tag:"flow-diagram",render:ea,onMount(e,t){let o={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(ie+1)};for(let s=1;s<=ie;s++)o.zones[s]={textTemp:t.querySelector("#fd-zt"+s),textSetpoint:t.querySelector("#fd-zsp"+s),textFlow:t.querySelector("#fd-zv"+s),textRet:t.querySelector("#fd-zr"+s),label:t.querySelector("#fd-zn"+s),friendly:t.querySelector("#fd-zf"+s),path:t.querySelector("#fd-path-"+s)};function r(){let s=z(a.flow),i=z(a.ret),n=o.flowEl,l=o.retEl,u=o.dtEl;if(n.textContent=Q(s),l.textContent="RET "+Q(i),s!=null&&i!=null){let g=Number(s)-Number(i);u.textContent=g.toFixed(1)+"\xB0C",u.setAttribute("fill",g<3?$o:g>8?Xo:Uo)}else u.textContent="---";for(let g=1;g<=ie;g++){let f=z(d.temp(g)),x=z(d.setpoint(g)),_=z(d.valve(g)),y=B(d.enabled(g)),h=String(E(d.tempSource(g))||"Local Probe"),v=Yo(E(d.probe(g))||""),c=v?z(d.probeTemp(v)):null,p=o.zones[g],w=p.textTemp,A=p.textSetpoint,O=p.textFlow,W=p.textRet,P=p.label,F=p.friendly,C=p.path,R=_!=null?Math.max(0,Math.min(100,Number(_)))/100:0;P.textContent="ZONE "+g;let H=Ko(g);F.textContent=H||"---",P.setAttribute("fill",y?jo:Vo),F.setAttribute("fill",y?fr:yt),A.setAttribute("fill",y?fr:yt);let $=F.getComputedTextLength?F.getComputedTextLength():0;A.setAttribute("x",String(Le+$+8));let K=Q(f),I=x!=null?Q(x):null;if(w.textContent=K,A.textContent=I?"("+I+")":"",O.textContent=Ze(_),O.setAttribute("fill",Jo(R,y)),h!=="Local Probe"&&c!=null&&!Number.isNaN(Number(c))?(W.textContent=Q(c),W.setAttribute("fill",y?Wo:vr)):(W.textContent="---",W.setAttribute("fill",hr)),!y)C.setAttribute("d",Je(g-1,1,2)),C.setAttribute("fill","#062a3a"),C.setAttribute("opacity","0.4");else{let ce=Math.max(3,R*xt),tt=Math.max(1.5,R*ht);C.setAttribute("d",Je(g-1,tt,ce)),C.setAttribute("fill","url(#rg"+g+")"),C.setAttribute("opacity","1")}}}b(a.flow,r),b(a.ret,r),D("zoneNames",r);for(let s=1;s<=ie;s++)b(d.temp(s),r),b(d.setpoint(s),r),b(d.valve(s),r),b(d.enabled(s),r),b(d.probe(s),r),b(d.tempSource(s),r);for(let s=1;s<=8;s++)b(d.probeTemp(s),r);r()}});var ta="http://www.w3.org/2000/svg",ra=24,oa=["N","NE","E","SE","S","SW","W","NW"],yr=1e3,wr=260,ge=44,aa=46,ae=16,na=52,Qe=yr-ge-aa,de=wr-ae-na,_r="var(--series-warm)",zr="var(--series-cool)",sa=`
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
.forecast-preview .fc-grid { stroke: rgba(150,168,205,.16); stroke-width: 1; }
.forecast-preview .fc-axis { stroke: rgba(150,168,205,.40); stroke-width: 1; }
.forecast-preview .fc-tick { font-size: 11px; fill: var(--chart-axis); }
.forecast-preview .fc-hour { font-size: 12px; fill: var(--text-secondary); font-weight: 700; }
.forecast-preview .fc-dir  { font-size: 10px; fill: var(--accent); font-family: var(--mono); }
`;S("forecast-preview",sa);var ia=()=>`
  <div class="forecast-preview">
    <div class="card-title">
      <span>Forecast (fetched)</span>
      <div class="fc-head-right">
        <div class="fc-legend">
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${_r}"></span>Temp</span>
          <span class="fc-legend-item"><span class="fc-legend-dot" style="background:${zr}"></span>Wind</span>
        </div>
        <span class="fc-badge">no data</span>
      </div>
    </div>
    <div class="fc-body"></div>
  </div>
`;function la(e){return e==null||Number.isNaN(e)?"":oa[Math.round(e/45)%8]}function da(e){return String(new Date(e*1e3).getHours()).padStart(2,"0")}function ca(e){return e==null?"":e<5400?Math.round(e/60)+" min old":Math.round(e/3600)+" h old"}function oe(e,t,o){let r=document.createElementNS(ta,e);if(t)for(let s in t)r.setAttribute(s,t[s]);return o!=null&&(r.textContent=o),r}function xr(e,t,o){let r=e.filter(l=>Number.isFinite(l));if(!r.length)return{min:t,max:o};let s=Math.min(...r),i=Math.max(...r);s===i&&(s-=1,i+=1);let n=(i-s)*.12;return{min:s-n,max:i+n}}function pa(e){let t=e.hours.slice(0,ra),o=t.map(v=>v[0]),r=t.map(v=>v[1]),s=xr(o,0,10),i=xr(r.concat([0]),0,10);i.min=0;let n=t.length,l=v=>ge+(n<=1?0:v/(n-1)*Qe),u=v=>ae+(1-(v-s.min)/(s.max-s.min))*de,g=v=>ae+(1-(v-i.min)/(i.max-i.min))*de,f=oe("svg",{viewBox:"0 0 "+yr+" "+wr,preserveAspectRatio:"xMidYMid meet"});for(let v=0;v<3;v++){let c=v/2,p=ae+c*de;f.appendChild(oe("line",{x1:ge,y1:p,x2:ge+Qe,y2:p,class:"fc-grid"})),f.appendChild(oe("text",{x:ge-6,y:p+4,"text-anchor":"end",class:"fc-tick"},(s.max-(s.max-s.min)*c).toFixed(0)+"\xB0")),f.appendChild(oe("text",{x:ge+Qe+6,y:p+4,"text-anchor":"start",class:"fc-tick"},(i.max-(i.max-i.min)*c).toFixed(0)))}f.appendChild(oe("line",{x1:ge,y1:ae+de,x2:ge+Qe,y2:ae+de,class:"fc-axis"}));let x="";for(let v=0;v<n;v++)x+=(v?" L ":"M ")+l(v).toFixed(1)+" "+g(r[v]).toFixed(1);let _=x+" L "+l(n-1).toFixed(1)+" "+(ae+de)+" L "+l(0).toFixed(1)+" "+(ae+de)+" Z";f.appendChild(oe("path",{d:_,fill:"var(--series-cool-fill)"})),f.appendChild(oe("path",{d:x,fill:"none",stroke:zr,"stroke-width":"2.4","stroke-linejoin":"round","stroke-linecap":"round"}));let y="";for(let v=0;v<n;v++)y+=(v?" L ":"M ")+l(v).toFixed(1)+" "+u(o[v]).toFixed(1);f.appendChild(oe("path",{d:y,fill:"none",stroke:_r,"stroke-width":"2.4","stroke-linejoin":"round","stroke-linecap":"round"}));let h=n>16?3:2;for(let v=0;v<n;v+=h){let c=l(v),p=e.base_epoch+v*3600;f.appendChild(oe("text",{x:c,y:ae+de+18,"text-anchor":"middle",class:"fc-hour"},da(p))),f.appendChild(oe("text",{x:c,y:ae+de+34,"text-anchor":"middle",class:"fc-dir"},la(t[v][2])))}return f}var Is=k({tag:"monitor-forecast-preview",render:ia,onMount(e,t){let o=t.querySelector(".fc-badge"),r=t.querySelector(".fc-body");function s(){let i=Nt(),n=i&&Array.isArray(i.hours)?i.hours:[];if(!(i?i.count||n.length:0)||!n.length||!i.base_epoch){o.textContent="no data",o.className="fc-badge",r.innerHTML='<div class="fc-empty">No forecast data fetched yet. Enable Forecast Preload in Settings and check the location.</div>';return}let u=(i.age_s||0)>3*3600;o.textContent=ca(i.age_s),o.className="fc-badge "+(u?"stale":"ok"),r.innerHTML="",r.appendChild(pa(i))}D("forecastHours",s),s()}});var ua={1:{label:"E",color:"#ff6361"},2:{label:"W",color:"#ffd380"},3:{label:"I",color:"#79d17e"},4:{label:"C",color:"#8a508f"},5:{label:"D",color:"rgba(214,228,255,.7)"},6:{label:"V",color:"rgba(214,228,255,.5)"},7:{label:"VV",color:"rgba(214,228,255,.4)"}},ma=`
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
`;S("logs-view",ma);var ga=()=>`
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
`;function fa(e){let t=ua[e.level]||{label:"?",color:"var(--text-secondary)"},o=Sr(e.tag||""),r=Sr(e.msg||"");return'<div class="log-line"><span class="lv" style="color:'+t.color+'">'+t.label+'</span><span class="tag">'+o+'</span><span class="msg">'+r+"</span></div>"}function Sr(e){return String(e).replace(/[&<>]/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[t])}var Vs=k({tag:"logs-view",render:ga,onMount(e,t){let o=t.querySelector(".logs-stream"),r=t.querySelector(".pause-btn"),s=t.querySelector(".clear-btn"),i=!1;function n(){if(i)return;let l=Mt();if(!l||!l.length){o.innerHTML='<div class="logs-empty">Waiting for device logs\u2026</div>';return}let u=o.scrollHeight-o.scrollTop-o.clientHeight<40;o.innerHTML=l.map(fa).join(""),u&&(o.scrollTop=o.scrollHeight)}r.addEventListener("click",()=>{i=!i,r.textContent=i?"Resume":"Pause",r.classList.toggle("on",i),i||n()}),s.addEventListener("click",()=>{At()}),D("deviceLog",n),n()}});var ba=`
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
}`;S("diag-i2c",ba);var va=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,Ks=k({tag:"diag-i2c",render:va,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=T("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{Rt()}),D("i2cResult",r),r()}});var ha=`
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
`;S("diag-activity",ha);var xa=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function ya(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let o="";for(let r=t.length-1;r>=0;r--)o+='<div class="diag-log-item"><span class="diag-log-time">'+t[r].time+'</span><span class="diag-log-msg">'+t[r].msg+"</span></div>";e.innerHTML=o}var ri=k({tag:"diag-activity",render:xa,onMount(e,t){let o=t.querySelector(".diag-log");function r(){ya(o,Lt())}D("activityLog",r),r()}});var wa=`
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
`;S("diag-manual-badge",wa);var _a=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,ii=k({tag:"diag-manual-badge",render:_a,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let s=!!T("manualMode");o&&o.classList.toggle("on",s)}D("manualMode",r),r()}});var za=`
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
`;S("diag-zone-motor",za);var Sa=e=>{let t=e.zone||T("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">Zone "+r+"</option>";return`
    <div class="diag-zone-motor">
      <div class="card-title">Motor Control</div>
      <div class="cfg-row manual-row">
        <span class="manual-note">Enable manual mode to suspend automatic management and unlock motor controls.</span>
        <div class="sw manual-mode-toggle" role="switch" aria-checked="false" tabindex="0"></div>
      </div>
      <div class="gated motor-gated locked">
        <div class="cfg-row">
          <span class="lbl">Motor</span>
          <select class="sel motor-zone-select">${o}</select>
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
  `},gi=k({tag:"diag-zone-motor-card",render:Sa,onMount(e,t){let o=Number(e.zone||T("selectedZone")||1),r=!!T("manualMode"),s=t.querySelector(".manual-mode-toggle"),i=t.querySelector(".motor-gated"),n=t.querySelector(".motor-zone-select"),l=t.querySelector(".motor-target-input"),u=t.querySelector(".motor-open-btn"),g=t.querySelector(".motor-close-btn"),f=t.querySelector(".motor-stop-btn");function x(h){r=!!h,s&&(s.classList.toggle("on",r),s.setAttribute("aria-checked",r?"true":"false")),i&&i.classList.toggle("locked",!r),[n,l,u,g,f].forEach(v=>{v&&(v.disabled=!r)})}function _(){let h=!r;if(x(h),h){st(!0);for(let v=1;v<=6;v++)nt(v)}else st(!1)}function y(){let h=z(d.motorTarget(o));l&&h!=null?l.value=Number(h).toFixed(0):l&&(l.value="0")}n==null||n.addEventListener("change",()=>{o=Number(n.value||1),y()}),s==null||s.addEventListener("click",_),s==null||s.addEventListener("keydown",h=>{h.key!==" "&&h.key!=="Enter"||(h.preventDefault(),_())});for(let h=1;h<=6;h++)b(d.motorTarget(h),y);y(),x(r),D("manualMode",()=>{x(!!T("manualMode"))}),l==null||l.addEventListener("change",h=>{if(!r)return;let v=h.target.value;It(o,v)}),u==null||u.addEventListener("click",()=>{r&&Bt(o,1e4)}),g==null||g.addEventListener("click",()=>{r&&Zt(o,1e4)}),f==null||f.addEventListener("click",()=>{r&&nt(o)})}});var ka=`
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
`;S("diag-zone-recovery",ka);var Ca=()=>`
    <div class="diag-zone-recovery">
      <div class="card-title">Faults &amp; Relearn</div>
      <div class="recovery-note">Recover the selected zone's motor after a fault or bad calibration.</div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
      <div class="recovery-status" role="status"></div>
    </div>
  `,yi=k({tag:"diag-zone-recovery-card",render:Ca,onMount(e,t){let o=Number(T("selectedZone")||1),r=t.querySelector(".recovery-fault-btn"),s=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn"),n=t.querySelector(".recovery-status");D("selectedZone",()=>{o=Number(T("selectedZone")||1)});let l=null;function u(f,x){n.textContent=f,n.className="recovery-status show "+(x?"ok":"err"),clearTimeout(l),l=setTimeout(()=>{n.classList.remove("show")},4e3)}function g(f,x){let _=f(o);u(x,!0),_&&typeof _.then=="function"&&_.then(y=>{y&&y.ok===!1&&u("Failed \u2014 device rejected the request",!1)}).catch(()=>u("Failed \u2014 could not reach device",!1))}r==null||r.addEventListener("click",()=>{g(Wt,"\u2713 Fault reset sent for "+ee(o))}),s==null||s.addEventListener("click",()=>{confirm("Reset learned factors for "+ee(o)+"?")&&g(jt,"\u2713 Learned factors reset for "+ee(o))}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for "+ee(o)+"?")&&g(Vt,"\u2713 Relearn started for "+ee(o))})}});var Ea=`
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
`;S("diag-system-card",Ea);var La=()=>`
  <div class="ui-card diag-system-card">
    <div class="ui-card-title"><span>System</span></div>
    <div class="sys-grid">
      <div class="sys-cell">
        <div class="sys-label">CPU Core 0</div>
        <div class="sys-value" data-k="cpu0">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu0"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">CPU Core 1</div>
        <div class="sys-value" data-k="cpu1">\u2014</div>
        <div class="sys-bar"><i data-bar="cpu1"></i></div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free Heap (int)</div>
        <div class="sys-value" data-k="heap">\u2014</div>
      </div>
      <div class="sys-cell">
        <div class="sys-label">Free PSRAM</div>
        <div class="sys-value" data-k="psram">\u2014</div>
      </div>
    </div>
    <button class="ui-btn sys-dump" type="button">Dump task stats to log</button>
    <div class="ui-note">Per-core load is sampled every 2&nbsp;s. "Dump task stats" logs every task's CPU% and stack headroom to the device log above \u2014 use it to find what saturates a core.</div>
  </div>
`,Ei=k({tag:"diag-system-card",render:La,onMount(e,t){let o=t.querySelector('[data-k="cpu0"]'),r=t.querySelector('[data-k="cpu1"]'),s=t.querySelector('[data-k="heap"]'),i=t.querySelector('[data-k="psram"]'),n=t.querySelector('[data-bar="cpu0"]'),l=t.querySelector('[data-bar="cpu1"]'),u=(x,_,y)=>{if(y==null||!Number.isFinite(Number(y))){x.textContent="\u2014",x.classList.remove("warn"),_.style.width="0%";return}let h=Math.max(0,Math.min(100,Number(y)));x.textContent=h.toFixed(0)+"%",x.classList.toggle("warn",h>=90),_.style.width=h+"%",_.style.backgroundPosition=h+"% 0"},g=(x,_,y)=>{if(_==null||!Number.isFinite(Number(_))){x.textContent="\u2014";return}let h=Number(_);x.textContent=h+" KB",x.classList.toggle("warn",y!=null&&h<y)},f=()=>{u(o,n,z(a.cpuLoadCore0)),u(r,l,z(a.cpuLoadCore1)),g(s,z(a.freeInternalKb),48),g(i,z(a.freePsramKb),null)};t.querySelector(".sys-dump").addEventListener("click",()=>{$t().catch(x=>console.error("[System] dump failed:",x))}),b(a.cpuLoadCore0,f),b(a.cpuLoadCore1,f),b(a.freeInternalKb,f),b(a.freePsramKb,f),f()}});var Fa=`
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
`;S("settings-manifold-card",Fa);var Ma=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
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
  `},Pi=k({tag:"settings-manifold-card",render:Ma,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),s=t.querySelector(".sm-ret"),i=G(t);i.select(o,{read:()=>E(a.manifoldType)||"NO (Normally Open)",commit:l=>Y("manifold_type",l)}),i.select(r,{read:()=>E(a.manifoldFlowProbe)||"Probe 7",commit:l=>Y("manifold_flow_probe",l)}),i.select(s,{read:()=>E(a.manifoldReturnProbe)||"Probe 8",commit:l=>Y("manifold_return_probe",l)});function n(){for(let l=1;l<=8;l++){let u=t.querySelector('[data-probe="'+l+'"]');u&&(u.textContent=Q(z(d.probeTemp(l))))}}b(a.manifoldType,i.refresh),b(a.manifoldFlowProbe,i.refresh),b(a.manifoldReturnProbe,i.refresh);for(let l=1;l<=8;l++)b(d.probeTemp(l),n);i.refresh(),n()}});var Aa=`
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
`;S("settings-control-card",Aa);var Na=()=>`
  <div class="settings-card settings-action-card">
    <div class="card-title">Device Control</div>
    <div class="btn-row">
      <button class="btn sc-reset-probe-map">Reset 1-Wire Probe Map</button>
      <button class="btn sc-dump-1wire">Dump 1-Wire Diagnostics</button>
      <button class="btn warn sc-restart">Restart Device</button>
    </div>
  </div>
`,Bi=k({tag:"settings-control-card",render:Na,onMount(e,t){t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{te("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{te("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{te("restart")})}});var Da=`
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
`;S("settings-motor-calibration-card",Da);var et=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:a.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:a.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:a.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:a.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:a.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:a.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:a.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:a.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:a.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:a.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:a.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:a.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Ta=()=>{let e="";for(let t=0;t<et.length;t++){let o=et[t],r=Oa(o.key)?"1":"0.1";e+='<div class="ui-row"><span class="ui-label">'+o.label+" ("+o.unit+')</span><span class="ui-field"><input type="number" class="ui-input smc-'+o.cls+'" value="0" step="'+r+'"></span></div>'}return`
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
  `};function Oa(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}var Xi=k({tag:"settings-motor-calibration-card",render:Ta,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime"),s=t.querySelector(".mc-drivers-toggle"),i=G(t);function n(u){if(u==="HmIP VdMot"&&J("hmip_runtime_limit_seconds",40),u==="Generic"){let g=Number(z(a.genericRuntimeLimitSeconds));(!Number.isFinite(g)||g<=0)&&J("generic_runtime_limit_seconds",45)}}i.toggle(s,{read:()=>B(a.drivers),commit:u=>He(u)}),i.select(o,{read:()=>E(a.motorProfileDefault)||"HmIP VdMot",commit:u=>{Y("motor_profile_default",u),n(u)}});function l(){let u=E(a.motorProfileDefault)||"HmIP VdMot";r.disabled=u==="HmIP VdMot"}i.num(r,{read:()=>(E(a.motorProfileDefault)||"HmIP VdMot")==="HmIP VdMot"?40:z(a.genericRuntimeLimitSeconds),commit:u=>{o.value==="Generic"&&J("generic_runtime_limit_seconds",u)}});for(let u=0;u<et.length;u++){let g=et[u];if(g.key==="generic_runtime_limit_seconds")continue;let f=t.querySelector(".smc-"+g.cls);f&&(i.num(f,{read:()=>z(g.id),commit:x=>J(g.key,x)}),b(g.id,i.refresh))}b(a.drivers,i.refresh),b(a.motorProfileDefault,()=>{i.refresh(),l()}),b(a.genericRuntimeLimitSeconds,i.refresh),b(a.hmipRuntimeLimitSeconds,i.refresh),n(E(a.motorProfileDefault)||"HmIP VdMot"),i.refresh(),l()}});var Pa=`
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
`;S("settings-asgard-card",Pa);var qa=()=>`
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
`,ol=k({tag:"settings-asgard-card",render:qa,onMount(e,t){let o=t.querySelector(".asgard-role-badge"),r=t.querySelector(".sa-enable"),s=t.querySelector(".sa-coord"),i=t.querySelector(".sa-host"),n=t.querySelector(".sa-port"),l=t.querySelector(".sa-entity"),u=t.querySelector(".sa-peer"),g=t.querySelector(".sa-interval"),f=t.querySelector(".sa-minflow"),x=t.querySelector(".sa-st-peer"),_=t.querySelector(".sa-st-push"),y=t.querySelector(".sa-st-setpoint"),h=t.querySelector(".sa-st-zones"),v=t.querySelector(".sa-st-err"),c=t.querySelector(".sa-body"),p=G(t);function w(F,C,R){return H=>{let $=H?"on":"off";m(F,{state:$}),Y(C,$).catch(K=>{console.error(`[Asgard] Failed to update ${R}:`,K),m(F,{state:H?"off":"on"})})}}let A=F=>c.classList.toggle("is-disabled",!F);p.toggle(r,{read:()=>B(a.asgardEnabled),commit:w(a.asgardEnabled,"asgard_enabled","enabled"),onChange:A}),p.toggle(s,{read:()=>B(a.asgardCoordinator),commit:w(a.asgardCoordinator,"asgard_coordinator","coordinator")});function O(F,C){return R=>{m(F,{state:R}),Ht(C,R).catch(H=>console.error(`[Asgard] Failed to update ${C}:`,H))}}p.text(i,{read:()=>E(a.asgardHost),commit:O(a.asgardHost,"asgard_host")}),p.text(l,{read:()=>E(a.asgardEntityName),commit:O(a.asgardEntityName,"asgard_entity_name")}),p.text(u,{read:()=>E(a.asgardPeerHost),commit:O(a.asgardPeerHost,"asgard_peer_host")});function W(F,C){return R=>{m(F,{value:R}),J(C,R).catch(H=>console.error(`[Asgard] Failed to update ${C}:`,H))}}p.num(n,{read:()=>z(a.asgardPort),commit:W(a.asgardPort,"asgard_port")}),p.num(g,{read:()=>z(a.asgardPushIntervalS),commit:W(a.asgardPushIntervalS,"asgard_push_interval_s")}),p.num(f,{read:()=>z(a.minZoneFlowPct),commit:W(a.minZoneFlowPct,"min_zone_flow_pct")});function P(){let F=E(a.asgardRole)||"slave";o.textContent=F,o.className="asgard-role-badge "+(F==="master"?"master":"slave");let C=E(a.asgardPeerStatus)||"n/a";x.textContent=C,x.classList.toggle("warn",C==="stale"||C==="unreachable");let R=z(a.asgardLastPushC),H=z(a.asgardLastPushAgeS);if(R!=null&&Number.isFinite(R)&&H!=null){let tt=H<120?`${Math.round(H)}s ago`:`${Math.round(H/60)}m ago`;_.textContent=`${R.toFixed(2)}\xB0C (${tt})`}else _.textContent="\u2014";let $=z(a.asgardSetpointC);y.textContent=$!=null&&Number.isFinite($)?`${$.toFixed(1)}\xB0C`:"\u2014";let K=z(a.asgardLocalZones),I=z(a.asgardPeerZones);h.textContent=K!=null?`${K} local + ${I||0} peer`:"\u2014";let ce=E(a.asgardLastError);v.textContent=ce||"\u2014",v.classList.toggle("warn",!!ce)}b(a.asgardEnabled,p.refresh),b(a.asgardCoordinator,p.refresh),b(a.asgardRole,P),b(a.asgardPeerStatus,P),b(a.asgardLastPushC,P),b(a.asgardSetpointC,P),b(a.asgardLastPushAgeS,P),b(a.asgardLocalZones,P),b(a.asgardPeerZones,P),b(a.asgardLastError,P),b(a.asgardHost,p.refresh),b(a.asgardEntityName,p.refresh),b(a.asgardPeerHost,p.refresh),b(a.asgardPort,p.refresh),b(a.asgardPushIntervalS,p.refresh),b(a.minZoneFlowPct,p.refresh),p.refresh(),P()}});var kr=[1,2,3,4,5,6],Ra=`
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
`;S("settings-forecast-card",Ra);var Ha=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,Ia=()=>`
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
          ${kr.map(Ha).join("")}
        </tbody>
      </table>
      <div class="ui-note fc-note">Live forecast preload offset applied to each zone right now (the hours-ahead figure is when the load peak is expected). Per-zone wind exposure, solar gain and thermal lead are configured in the Zone card alongside Exterior Walls.</div>
    </div>
  </div>
`,pl=k({tag:"settings-forecast-card",render:Ia,onMount(e,t){let o=t.querySelector(".fc-badge"),r=t.querySelector(".fc-enable"),s=t.querySelector(".fc-body"),i=t.querySelector(".fc-lat"),n=t.querySelector(".fc-lon"),l=t.querySelector(".fc-threshold"),u=t.querySelector(".fc-maxoffset"),g=G(t),f=h=>{s&&s.classList.toggle("is-disabled",!h)};g.toggle(r,{read:()=>B(a.forecastEnabled),onChange:f,commit:h=>{let v=h?"on":"off";m(a.forecastEnabled,{state:v}),Y("forecast_enabled",v).catch(c=>{console.error("[Forecast] toggle failed:",c),m(a.forecastEnabled,{state:h?"off":"on"})})}});function x(h,v){return c=>{m(h,{value:c}),J(v,c).catch(p=>console.error(`[Forecast] ${v} failed:`,p))}}g.num(i,{nostep:!0,read:()=>z(a.forecastLatitude),commit:x(a.forecastLatitude,"forecast_latitude")}),g.num(n,{nostep:!0,read:()=>z(a.forecastLongitude),commit:x(a.forecastLongitude,"forecast_longitude")}),g.num(l,{read:()=>z(a.forecastLoadThreshold),commit:x(a.forecastLoadThreshold,"forecast_load_threshold")}),g.num(u,{read:()=>z(a.forecastMaxOffsetC),commit:x(a.forecastMaxOffsetC,"forecast_max_offset_c")});function _(){let h=E(a.forecastStatus)||"disabled";o.textContent=h,o.className="fc-badge",h==="ok"?o.classList.add("ok"):(h==="stale"||h.indexOf("external")>=0)&&o.classList.add("external")}function y(){t.querySelectorAll(".fc-zone-body tr").forEach(h=>{let v=parseInt(h.getAttribute("data-zone"),10),c=h.querySelector(".fc-offset"),p=z(d.forecastOffset(v)),w=z(d.forecastPeakH(v));p!=null&&p>.01?(c.textContent=`+${p.toFixed(1)}\xB0`+(w!=null&&w>=0?` (${w}h)`:""),c.classList.add("active")):(c.textContent="\u2014",c.classList.remove("active"))})}b(a.forecastStatus,_),b(a.forecastEnabled,()=>{g.refresh(),_()}),b(a.forecastLatitude,g.refresh),b(a.forecastLongitude,g.refresh),b(a.forecastLoadThreshold,g.refresh),b(a.forecastMaxOffsetC,g.refresh),kr.forEach(h=>{b(d.forecastOffset(h),y)}),_(),y(),g.refresh()}});var Cr=[1,2,3,4,5,6],Ba=`
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
`;S("settings-balancing-card",Ba);var Za=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td class="bal-static">\u2014</td>
    <td class="bal-adapt">\u2014</td>
    <td class="bal-eff eff">\u2014</td>
    <td class="bal-err err">\u2014</td>
  </tr>
`,Wa=()=>`
  <div class="ui-card settings-balancing-card">
    <div class="ui-card-title"><span>Hydraulic Balancing</span></div>

    <div class="ui-row">
      <span class="ui-label">Balancing mode</span>
      <span class="ui-field"><select class="ui-select bal-mode">
        <option>Static</option>
        <option>Adaptive</option>
      </select></span>
    </div>
    <div class="ui-note">Static splits flow from the resistance-aware design model (area, pipe, floor). Adaptive adds a slow room-temperature correction on top \u2014 no return probes \u2014 nudging chronically cold loops open and over-served loops closed over days. It only redistributes flow between loops, never raises total demand.</div>

    <div class="ui-section">Per-zone factors</div>
    <table class="zone-table">
      <thead>
        <tr><th>Zone</th><th>Prior</th><th>Learned</th><th>Effective</th><th>Error</th></tr>
      </thead>
      <tbody class="bal-zone-body">
        ${Cr.map(Za).join("")}
      </tbody>
    </table>
    <div class="ui-note">Prior = static design factor \xB7 Learned = adaptive multiplier \xB7 Effective = prior \xD7 learned (the valve scale applied). Error is the long-window setpoint\u2212room average a cold (+) loop is boosted on, a warm (\u2212) loop throttled.</div>

    <div class="gated-body bal-adaptive-body">
      <div class="ui-section">Adaptive tuning</div>
      <div class="ui-row">
        <span class="ui-label">Update interval (s)</span>
        <span class="ui-field"><input class="ui-input bal-interval" type="number" min="60" max="86400" step="60" placeholder="3600" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Step (k)</span>
        <span class="ui-field"><input class="ui-input bal-step" type="number" min="0.001" max="0.2" step="0.01" placeholder="0.02" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Min factor</span>
        <span class="ui-field"><input class="ui-input bal-min" type="number" min="0.1" max="1" step="0.05" placeholder="0.5" /></span>
      </div>
      <div class="ui-row">
        <span class="ui-label">Max factor</span>
        <span class="ui-field"><input class="ui-input bal-max" type="number" min="1" max="3" step="0.05" placeholder="1.5" /></span>
      </div>
      <button class="ui-btn warn bal-reset" type="button">Reset balancing</button>
      <div class="ui-note">Reset clears every loop's learned multiplier back to 1.0 (relearns over days). The step bounds the per-update move; convergence is intentionally slow to match the slab's thermal lag.</div>
    </div>
  </div>
`,xl=k({tag:"settings-balancing-card",render:Wa,onMount(e,t){let o=t.querySelector(".bal-mode"),r=t.querySelector(".bal-adaptive-body"),s=t.querySelector(".bal-interval"),i=t.querySelector(".bal-step"),n=t.querySelector(".bal-min"),l=t.querySelector(".bal-max"),u=G(t),g=y=>{r&&r.classList.toggle("is-disabled",y!=="Adaptive")};u.select(o,{read:()=>E(a.balanceMode)||"Static",commit:y=>Y("balance_mode",y)}),o.addEventListener("change",()=>g(o.value));function f(y,h){return v=>{m(y,{value:v}),J(h,v).catch(c=>console.error(`[Balancing] ${h} failed:`,c))}}u.num(s,{read:()=>z(a.adaptIntervalS),commit:f(a.adaptIntervalS,"adapt_interval_s")}),u.num(i,{read:()=>z(a.adaptStep),commit:f(a.adaptStep,"adapt_step")}),u.num(n,{read:()=>z(a.adaptMin),commit:f(a.adaptMin,"adapt_min")}),u.num(l,{read:()=>z(a.adaptMax),commit:f(a.adaptMax,"adapt_max")}),t.querySelector(".bal-reset").addEventListener("click",()=>{Gt().catch(y=>console.error("[Balancing] reset failed:",y))});let x=(y,h=2)=>y!=null&&Number.isFinite(Number(y))?Number(y).toFixed(h):"\u2014";function _(){t.querySelectorAll(".bal-zone-body tr").forEach(y=>{let h=parseInt(y.getAttribute("data-zone"),10);y.querySelector(".bal-static").textContent=x(z(d.staticFactor(h))),y.querySelector(".bal-adapt").textContent=x(z(d.balanceAdapt(h))),y.querySelector(".bal-eff").textContent=x(z(d.balanceFactor(h)));let v=z(d.adaptErr(h)),c=y.querySelector(".bal-err");c.classList.remove("cold","warm"),v==null||!Number.isFinite(Number(v))?c.textContent="\u2014":(c.textContent=(v>=0?"+":"")+Number(v).toFixed(2),c.classList.add(v>.05?"cold":v<-.05?"warm":""))})}b(a.balanceMode,()=>{u.refresh(),g(E(a.balanceMode)||"Static")}),b(a.adaptIntervalS,u.refresh),b(a.adaptStep,u.refresh),b(a.adaptMin,u.refresh),b(a.adaptMax,u.refresh),Cr.forEach(y=>{b(d.staticFactor(y),_),b(d.balanceAdapt(y),_),b(d.balanceFactor(y),_),b(d.adaptErr(y),_)}),u.refresh(),g(E(a.balanceMode)||"Static"),_()}});var ja=`
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
`;S("smart-preheat-card",ja);var Va=()=>`
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
`,El=k({tag:"smart-preheat-card",render:Va,onMount(e,t){let o=t.querySelector(".preheat-toggle"),r=t.querySelector(".absorb-toggle"),s=t.querySelector(".absorb-badge"),i=t.querySelector(".absorb-band"),n=t.querySelector(".absorb-delta"),l=t.querySelector(".absorb-body");function u(){let _=String(E(a.simplePreheatEnabled)||"").toLowerCase();return _==="on"||_==="true"||_==="1"||_==="enabled"}let g=G(t);g.toggle(o,{read:u,commit:_=>Y("simple_preheat_enabled",_?"on":"off")});let f=_=>{l&&l.classList.toggle("is-disabled",!_)};g.toggle(r,{read:()=>B(a.preheatAbsorbEnabled),onChange:f,commit:_=>{let y=_?"on":"off";m(a.preheatAbsorbEnabled,{state:y}),Y("preheat_absorb_enabled",y)}}),g.num(i,{read:()=>z(a.preheatAbsorbBandC),commit:_=>{m(a.preheatAbsorbBandC,{value:_}),J("preheat_absorb_band_c",_)}}),g.num(n,{read:()=>z(a.preheatDetectDeltaC),commit:_=>{m(a.preheatDetectDeltaC,{value:_}),J("preheat_detect_delta_c",_)}});function x(){let _=String(E(a.preheatAbsorbing)||"").toLowerCase()==="active";s.textContent=_?"active":"idle",s.classList.toggle("active",_)}b(a.simplePreheatEnabled,g.refresh),b(a.preheatAbsorbEnabled,g.refresh),b(a.preheatAbsorbing,x),b(a.preheatAbsorbBandC,g.refresh),b(a.preheatDetectDeltaC,g.refresh),g.refresh(),x()}});var Ga=`
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
`;S("settings-smart-heating",Ga);var $a=()=>`
  <div class="settings-smart-heating">
    <div class="sh-section sh-preheat-slot"></div>
    <div class="sh-section sh-forecast-slot"></div>
  </div>
`,Al=k({tag:"settings-smart-heating-card",render:$a,onMount(e,t){t.querySelector(".sh-preheat-slot").appendChild(q("smart-preheat-card")),t.querySelector(".sh-forecast-slot").appendChild(q("settings-forecast-card"))}});var Ua=`
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
  --panel-bg: linear-gradient(180deg, rgba(0,63,92,.40), rgba(0,32,46,.40));
  --panel-bg-vibrant: radial-gradient(900px 300px at 90% -40%, rgba(255,166,0,.14), transparent 62%), linear-gradient(180deg, rgba(0,63,92,.44), rgba(0,32,46,.40));
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
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 14px;
  align-items: stretch;
}

.overview-flow-return,
.overview-demand {
  display: flex;
  flex-direction: column;
}

.overview-flow-return > *,
.overview-demand > * {
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
  background: linear-gradient(180deg, rgba(0,63,92,.40), rgba(0,32,46,.40));
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
`;S("app-root",Ua);var Xa=e=>`
  <div class="app">
    <main class="shell">
      <div class="hdr"></div>
      <section class="sec active" data-section="overview">
        <div class="overview-flow"></div>
        <div class="overview-timeline" style="margin-top:14px"></div>
        <div class="dashboard-grid">
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
          <div class="settings-balancing-slot"></div>
        </div>
      </section>
      <section class="sec" data-section="logs">
        <div class="logs-layout">
          <div class="logs-main-col"></div>
          <div class="logs-side-col"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;k({tag:"app-root",render:Xa,onMount(e,t){t.querySelector(".hdr").appendChild(q("hv6-header")),t.querySelector(".overview-flow").appendChild(q("flow-diagram")),t.querySelector(".overview-timeline").appendChild(q("zone-state-timeline")),t.querySelector(".overview-flow-return").appendChild(q("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(q("graph-widgets",{variant:"demand"})),t.querySelector(".overview-forecast").appendChild(q("monitor-forecast-preview")),t.querySelector(".zone-selector").appendChild(q("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(q("zone-detail",{zone:T("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(q("zone-sensor-card")),t.querySelector(".zone-recovery-slot").appendChild(q("diag-zone-recovery-card")),t.querySelector(".zone-room-slot").appendChild(q("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(q("settings-manifold-card")),t.querySelector(".settings-asgard-slot").appendChild(q("settings-asgard-card")),t.querySelector(".settings-motor-cal-slot").appendChild(q("settings-motor-calibration-card")),t.querySelector(".settings-smart-heating-slot").appendChild(q("settings-smart-heating-card")),t.querySelector(".settings-balancing-slot").appendChild(q("settings-balancing-card"));let o=t.querySelector(".logs-main-col");o.appendChild(q("logs-view")),o.appendChild(q("diag-activity"));let r=t.querySelector(".logs-side-col");r.appendChild(q("connectivity-card")),r.appendChild(q("diag-system-card")),r.appendChild(q("diag-zone-motor-card",{zone:T("selectedZone")||1})),r.appendChild(q("settings-control-card")),r.appendChild(q("diag-manual-badge")),r.appendChild(q("diag-i2c"));let s=t.querySelectorAll(".sec");function i(){let n=T("section");s.forEach(l=>{l.classList.toggle("active",l.getAttribute("data-section")===n)})}D("section",i),i()}});function Ya(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(q("app-root")),pt()}Ya();})();

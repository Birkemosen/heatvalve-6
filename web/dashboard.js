(()=>{var ot={},Ae={};function z(e){return ot[e.tag]=e,e}function O(e,t){let r=ot[e];if(!r)throw new Error("Component not found: "+e);let o=t||{};if(r.state){let i=r.state(t||{});for(let d in i)o[d]=i[d]}if(r.methods)for(let i in r.methods)o[i]=r.methods[i];let s=document.createElement("div");s.innerHTML=r.render(o);let n=s.firstElementChild;return r.onMount&&r.onMount(o,n),n}function p(e,t){(Ae[e]||(Ae[e]=[])).push(t)}function U(e){let t=Ae[e];if(t)for(let r=0;r<t.length;r++)t[r](e)}var Q=6,jt=28,Le=Object.create(null),$t=Gt(),T={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Vt(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:$t,manualMode:!1,zoneStateHistory:null};function Vt(){let e=Object.create(null);for(let t=1;t<=Q;t++)e[t]=[];return e}function Gt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<Q;)e.push("");return e.slice(0,Q)}function Ut(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(T.zoneNames))}catch(e){}}function X(e){return"$dashboard:"+e}function Fe(e){return Math.max(1,Math.min(Q,Number(e)||1))}function rt(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let r=e.match(/-?\d+(?:[\.,]\d+)?/);if(r){let o=Number(String(r[0]).replace(",","."));return Number.isNaN(o)?null:o}}return null}function h(e){let t=Le[e];return t?t.v!=null?t.v:t.value!=null?t.value:rt(t.s!=null?t.s:t.state):null}function _(e){let t=Le[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Xt(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function q(e){return Xt(_(e))}function g(e,t){let r=Le[e];r||(r=Le[e]={v:null,s:null}),"v"in t&&(r.v=t.v,r.value=t.v),"value"in t&&(r.v=t.value,r.value=t.value),"s"in t&&(r.s=t.s,r.state=t.s),"state"in t&&(r.s=t.state,r.state=t.state);for(let o in t)o==="v"||o==="value"||o==="s"||o==="state"||(r[o]=t[o]);U(e),e==="text_sensor-firmware_version"&&ie("firmwareVersion",_(e)||"")}function M(e,t){p(X(e),t)}function C(e){return T[e]}function ie(e,t){T[e]=t,U(X(e))}function at(e){T.section!==e&&(T.section=e,U(X("section")))}function nt(e){let t=Fe(e);T.selectedZone!==t&&(T.selectedZone=t,U(X("selectedZone")))}function le(e){let t=!!e;T.live!==t&&(T.live=t,U(X("live")))}function st(){T.pendingWrites+=1,U(X("pendingWrites"))}function We(){T.pendingWrites=Math.max(0,T.pendingWrites-1),T.lastWriteAt=Date.now(),U(X("pendingWrites"))}function it(){return T.pendingWrites>0?!0:Date.now()-T.lastWriteAt<2e3}function lt(e,t){let r=Fe(e)-1;T.zoneNames[r]=String(t||"").trim(),Ut(),U(X("zoneNames"))}function re(e){return T.zoneNames[Fe(e)-1]||""}function de(e){let t=Fe(e),r=re(t);return r?"Zone "+t+" \xB7 "+r:"Zone "+t}function ce(e){T.i2cResult=e||"No scan has been run yet.",U(X("i2cResult"))}function L(e,t){let r={time:Yt(),msg:String(e||"")};for(T.activityLog.push(r);T.activityLog.length>60;)T.activityLog.shift();if(t>=1&&t<=Q){let o=T.zoneLog[t];for(o.push(r);o.length>8;)o.shift();U(X("zoneLog:"+t))}U(X("activityLog"))}function dt(e){return e>=1&&e<=Q?T.zoneLog[e]:T.activityLog}function Be(e,t){let r=T[e];if(!Array.isArray(r))return;let o=rt(t);if(o!=null){for(r.push(o);r.length>jt;)r.shift();U(X(e))}}function fe(e){let t=Date.now();if(!e&&t-T.lastHistoryAt<3200)return;T.lastHistoryAt=t;let r=0,o=0;for(let s=1;s<=Q;s++){let n=h("sensor-zone_"+s+"_valve_pct");n!=null&&(r+=n,o+=1)}Be("historyFlow",h("sensor-manifold_flow_temperature")),Be("historyReturn",h("sensor-manifold_return_temperature")),Be("historyDemand",o?r/o:0)}function Yt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Me(e){T.zoneStateHistory=e||null,U(X("zoneStateHistory"))}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h"},a={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",heliosEnabled:"switch-helios_enabled",heliosHost:"text-helios_host",heliosPort:"number-helios_port",heliosControllerId:"text-helios_controller_id",heliosPollIntervalS:"number-helios_poll_interval_s",heliosStaleAfterS:"number-helios_stale_after_s",heliosStatus:"helios_status",heliosDeviceId:"text-helios_device_id",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c"};var Z=6,Jt=8,ct=null,ve=0,E={temp:new Float32Array(Z),setpoint:new Float32Array(Z),valve:new Float32Array(Z),enabled:new Uint8Array(Z),driversEnabled:1,fault:0,manualMode:0};function Qt(){E.manualMode=0,ie("manualMode",!1);for(let n=0;n<Z;n++){E.temp[n]=20.5+n*.4,E.setpoint[n]=21+n%3*.5,E.valve[n]=12+n*8,E.enabled[n]=n===4?0:1;let i=n+1;g(l.temp(i),{value:E.temp[n]}),g(l.setpoint(i),{value:E.setpoint[n]}),g(l.valve(i),{value:E.valve[n]}),g(l.state(i),{state:E.valve[n]>5?"heating":"idle"}),g(l.enabled(i),{value:!!E.enabled[n],state:E.enabled[n]?"on":"off"}),g(l.probe(i),{state:"Probe "+i}),g(l.tempSource(i),{state:i%2?"Local Probe":"BLE"}),g(l.syncTo(i),{state:"None"}),g(l.pipeType(i),{state:"PEX 16mm"}),g(l.area(i),{value:8+i*3.5}),g(l.spacing(i),{value:[150,200,150,100,200,150][n]}),g(l.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),g(l.exteriorWalls(i),{state:["N","E","S","W","N,E","S,W"][n]}),g(l.preheatAdvance(i),{value:.08+n*.03})}for(let n=1;n<=Jt;n++){let i=n<=Z?n:Z,d=E.temp[i-1]+(n>Z?1:.1*n);g(l.probeTemp(n),{value:d})}g(a.flow,{value:34.1}),g(a.ret,{value:30.4}),g(a.uptime,{value:18*3600+720}),g(a.wifi,{value:-57}),g(a.drivers,{value:!0,state:"on"}),g(a.fault,{value:!1,state:"off"}),g(a.ip,{state:"192.168.1.86"}),g(a.ssid,{state:"MockLab"}),g(a.mac,{state:"D8:3B:DA:12:34:56"}),g(a.firmware,{state:"0.5.x-mock"}),g(a.manifoldFlowProbe,{state:"Probe 7"}),g(a.manifoldReturnProbe,{state:"Probe 8"}),g(a.manifoldType,{state:"NC (Normally Closed)"}),g(a.motorProfileDefault,{state:"HmIP VdMot"}),g(a.closeThresholdMultiplier,{value:1.7}),g(a.closeSlopeThreshold,{value:1}),g(a.closeSlopeCurrentFactor,{value:1.4}),g(a.openThresholdMultiplier,{value:1.7}),g(a.openSlopeThreshold,{value:.8}),g(a.openSlopeCurrentFactor,{value:1.3}),g(a.openRippleLimitFactor,{value:1}),g(a.genericRuntimeLimitSeconds,{value:45}),g(a.hmipRuntimeLimitSeconds,{value:40}),g(a.relearnAfterMovements,{value:2e3}),g(a.relearnAfterHours,{value:168}),g(a.learnedFactorMinSamples,{value:3}),g(a.learnedFactorMaxDeviationPct,{value:12}),g(a.simplePreheatEnabled,{state:"on"}),fe(!0);let e=300,t=Number(Date.now()/1e3)|0,r=288,o=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let n=0;n<r;n++){let i=(r-1-n)*e,d=t-i,u=Math.floor(n/12)%24,m=o.map(v=>v[u%v.length]);s.push([d,...m])}Me({interval_s:e,uptime_s:t,count:r,entries:s})}function Kt(){ve+=1,g(a.uptime,{value:Number(Date.now()/1e3)|0}),g(a.wifi,{value:-55-Math.round((1+Math.sin(ve/4))*6)});let e=0,t=0,r=0;for(let i=0;i<Z;i++){let d=i+1,u=!!E.enabled[i],m=E.temp[i],v=E.setpoint[i],y=u&&E.driversEnabled&&!E.manualMode&&m<v-.25;E.manualMode?E.valve[i]=Math.max(0,E.valve[i]):!u||!E.driversEnabled?E.valve[i]=Math.max(0,E.valve[i]-6):y?E.valve[i]=Math.min(100,E.valve[i]+7+d%3):E.valve[i]=Math.max(0,E.valve[i]-5);let w=y?.05+E.valve[i]/2200:-.03+E.valve[i]/3200;E.temp[i]=m+w+Math.sin((ve+d)/5)*.04,u&&E.valve[i]>0&&(e+=E.valve[i],t+=1,r=Math.max(r,E.valve[i])),g(l.temp(d),{value:E.temp[i]}),g(l.valve(d),{value:Math.round(E.valve[i])});let f=Math.max(0,(E.setpoint[i]-E.temp[i]-.15)*.22);g(l.preheatAdvance(d),{value:Number(f.toFixed(2))}),g(l.state(d),{state:u?y?"heating":"idle":"off"}),g(l.enabled(d),{value:u,state:u?"on":"off"}),g(l.probeTemp(d),{value:E.temp[i]+Math.sin((ve+d)/6)*.1})}let o=29.5+r*.075+t*.18+Math.sin(ve/6)*.25,s=o-(t?2.1+e/Math.max(1,t*50):1.1);g(a.flow,{value:Number(o.toFixed(1))}),g(a.ret,{value:Number(s.toFixed(1))}),g(l.probeTemp(7),{value:Number((s-.4).toFixed(1))}),g(l.probeTemp(8),{value:Number((o+.2).toFixed(1))}),fe(!0);let n=C("zoneStateHistory");n&&(n.uptime_s=Number(Date.now()/1e3)|0)}function pt(){ct||(Qt(),le(!0),ct=setInterval(Kt,1200))}function Ne(e){let t=e.key||"",r=e.value,o=e.zone||0;if(t==="zone_setpoint"&&o>=1&&o<=Z){let n=Number(r);Number.isNaN(n)||(E.setpoint[o-1]=n,g(l.setpoint(o),{value:n}),L("Zone "+o+" setpoint set to "+n.toFixed(1)+"\xB0C",o));return}if(t==="zone_enabled"&&o>=1&&o<=Z){let n=r>.5;E.enabled[o-1]=n?1:0,g(l.enabled(o),{value:n,state:n?"on":"off"}),L("Zone "+o+(n?" enabled":" disabled"),o);return}if(t==="drivers_enabled"){let n=r>.5;E.driversEnabled=n?1:0,g(a.drivers,{value:n,state:n?"on":"off"}),L(n?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let n=r>.5;E.manualMode=n?1:0,ie("manualMode",n);return}if(t==="motor_target"&&o>=1&&o<=Z){let n=Number(r||0);g(l.motorTarget(o),{value:Math.max(0,Math.min(100,Math.round(n)))}),L("Motor "+o+" target set to "+n+"%",o);return}if(t==="command"){let n=String(r);if(n==="i2c_scan"){ce(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),L("I2C scan complete");return}if(n==="calibrate_all_motors"||n==="restart"){L("Command executed: "+n);return}if(n==="open_motor_timed"&&o>=1&&o<=Z){L("Motor "+o+" open timed",o);return}if(n==="close_motor_timed"&&o>=1&&o<=Z){L("Motor "+o+" close timed",o);return}if(n==="stop_motor"&&o>=1&&o<=Z){L("Motor "+o+" stopped",o);return}if(n==="motor_reset_fault"&&o>=1&&o<=Z){L("Motor "+o+" fault reset",o);return}if(n==="motor_reset_learned_factors"&&o>=1&&o<=Z){L("Motor "+o+" learned factors reset",o);return}if(n==="motor_reset_and_relearn"&&o>=1&&o<=Z){L("Motor "+o+" reset and relearn started",o);return}return}if(t==="zone_probe"&&o>=1){g(l.probe(o),{state:String(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_temp_source"&&o>=1){g(l.tempSource(o),{state:String(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_sync_to"&&o>=1){g(l.syncTo(o),{state:String(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_type"&&o>=1){g(l.pipeType(o),{state:String(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="manifold_type"){g(a.manifoldType,{state:String(r)}),L("Setting updated: "+t+" = "+r);return}if(t==="manifold_flow_probe"){g(a.manifoldFlowProbe,{state:String(r)}),L("Setting updated: "+t+" = "+r);return}if(t==="manifold_return_probe"){g(a.manifoldReturnProbe,{state:String(r)}),L("Setting updated: "+t+" = "+r);return}if(t==="motor_profile_default"){g(a.motorProfileDefault,{state:String(r)}),L("Setting updated: "+t+" = "+r);return}if(t==="simple_preheat_enabled"){g(a.simplePreheatEnabled,{state:String(r)}),L("Setting updated: "+t+" = "+r);return}if(t==="zone_ble_mac"&&o>=1){g(l.ble(o),{state:String(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_exterior_walls"&&o>=1){g(l.exteriorWalls(o),{state:String(r)||"None"}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_area_m2"&&o>=1){g(l.area(o),{value:Number(r)}),L("Setting updated: "+t+" = "+r,o);return}if(t==="zone_pipe_spacing_mm"&&o>=1){g(l.spacing(o),{value:Number(r)}),L("Setting updated: "+t+" = "+r,o);return}let s={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct};if(s[t]){let n=Number(r);Number.isNaN(n)||(g(s[t],{value:n}),L("Setting updated: "+t+" = "+r));return}}window.__hv6_mock={setSetpoint(e,t){Ne({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!E.enabled[e-1];Ne({key:"zone_enabled",value:t?1:0,zone:e})}};var gt="/api/hv6/v1";function ut(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function $(e,t,r){if(st(),ut())try{return Ne(r),Promise.resolve({ok:!0})}finally{We()}let o=new URLSearchParams;for(let[i,d]of Object.entries(t||{}))d!=null&&o.append(i,d);let s=o.toString(),n=gt+e+(s?"?"+s:"");return fetch(n,{method:"POST"}).then(i=>(i.ok||console.warn(`API call failed: POST ${e} status=${i.status}`),i)).catch(i=>{throw console.error(`API call error: POST ${e}:`,i),i}).finally(()=>{We()})}function je(e,t){return g(l.setpoint(e),{value:t}),$(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function bt(e,t){return g(l.enabled(e),{state:t?"on":"off",value:t}),$(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function De(e){return g(a.drivers,{state:e?"on":"off",value:e}),$("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ae(e,t){return $("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function mt(){return ce("Scanning I2C bus..."),L("I2C scan started"),ae("i2c_scan")}var eo={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},to={zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e)},oo={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},ro={manifold_type:a.manifoldType,manifold_flow_probe:a.manifoldFlowProbe,manifold_return_probe:a.manifoldReturnProbe,motor_profile_default:a.motorProfileDefault,simple_preheat_enabled:a.simplePreheatEnabled,helios_enabled:a.heliosEnabled},ao={close_threshold_multiplier:a.closeThresholdMultiplier,close_slope_threshold:a.closeSlopeThreshold,close_slope_current_factor:a.closeSlopeCurrentFactor,open_threshold_multiplier:a.openThresholdMultiplier,open_slope_threshold:a.openSlopeThreshold,open_slope_current_factor:a.openSlopeCurrentFactor,open_ripple_limit_factor:a.openRippleLimitFactor,generic_runtime_limit_seconds:a.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:a.hmipRuntimeLimitSeconds,relearn_after_movements:a.relearnAfterMovements,relearn_after_hours:a.relearnAfterHours,learned_factor_min_samples:a.learnedFactorMinSamples,learned_factor_max_deviation_pct:a.learnedFactorMaxDeviationPct,helios_port:a.heliosPort,helios_poll_interval_s:a.heliosPollIntervalS,helios_stale_after_s:a.heliosStaleAfterS};function pe(e,t,r){let o=eo[t];return o&&g(o(e),{state:r}),$("/settings/select",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function xe(e,t,r){let o=to[t];return o&&g(o(e),{state:r}),$("/settings/text",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function he(e,t,r){let o=Number(r),s=oo[t];return s&&!Number.isNaN(o)&&g(s(e),{value:o}),$("/settings/number",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function V(e,t){let r=ro[e];return r&&g(r,{state:t}),$("/settings/select",{key:e,value:t},{key:e,value:t})}function B(e,t){let r=Number(t),o=ao[e];return o&&!Number.isNaN(r)&&g(o,{value:r}),$("/settings/number",{key:e,value:r},{key:e,value:r})}function ye(e,t){return $("/settings/text",{key:e,value:t},{key:e,value:t})}function ft(e,t){let r=Number(t),o=Number.isNaN(r)?0:Math.max(0,Math.min(100,Math.round(r)));return g(l.motorTarget(e),{value:o}),L("Motor "+e+" target set to "+o+"%",e),$(`/motors/${e}/target`,{value:o},{key:"motor_target",value:o,zone:e})}function vt(e,t=1e4){return L("Motor "+e+" open for "+t+"ms",e),$(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function xt(e,t=1e4){return L("Motor "+e+" close for "+t+"ms",e),$(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function $e(e){return L("Motor "+e+" stopped",e),$(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function Ve(e){return ie("manualMode",!!e),L(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),$("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function ht(e){return L("Motor "+e+" fault reset",e),ae("motor_reset_fault",e)}function yt(e){return L("Motor "+e+" learned factors reset",e),ae("motor_reset_learned_factors",e)}function wt(e){return L("Motor "+e+" reset and relearn started",e),ae("motor_reset_and_relearn",e)}function Ge(){ut()||fetch(gt+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Me(e)}).catch(()=>{})}var Ue=null,Te=null,_t=null;async function no(){Te&&Te.abort(),Te=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:Te.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function zt(e){if(!(!e||typeof e!="object")&&!it()){for(let t in e)g(t,e[t]);fe(!1)}}function so(e){if(e){if(!e.type){zt(e);return}if(e.type==="state"){zt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;L(t),String(t).indexOf("I2C_SCAN:")!==-1&&ce(String(t))}}}function St(){Ue||(Ue=setTimeout(()=>{Ue=null,Xe()},1e3))}function Xe(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){pt();return}no().then(t=>{le(!0),so(t),Ge(),_t||(_t=setInterval(Ge,300*1e3)),St()}).catch(()=>{le(!1),St()})}var kt=Object.create(null);function S(e,t){if(kt[e])return;kt[e]=1;let r=document.createElement("style");r.textContent=t,document.head.appendChild(r)}function W(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function ge(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Oe(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,r=e%86400/3600|0,o=e%3600/60|0;return t>0?t+"d "+r+"h "+o+"m":r>0?r+"h "+o+"m":o+"m"}function Et(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var io=`
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
`;S("hv6-header",io);var lo=()=>`
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
`,ca=z({tag:"hv6-header",render:lo,onMount(e,t){let r=t.querySelector("#hdr-mode"),o=t.querySelector("#hdr-dot"),s=t.querySelector("#hdr-sync"),n=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),d=t.querySelector("#hdr-fw"),u=t.querySelectorAll(".menu-link");function m(){let y=C("section");u.forEach(w=>{w.classList.toggle("active",w.getAttribute("data-section")===y)})}function v(){let y=C("live"),w=C("pendingWrites"),f=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":y?"Live":"Offline";r.textContent=f,o.classList.toggle("on",!!y),s.textContent=w>0?"Saving...":y?"Synced":"Offline";let c=w>0?"saving":y?"synced":"offline";s.className="meta-chip meta-chip-state "+c,n.textContent=Oe(h(a.uptime)),i.textContent=Et(h(a.wifi));let x=C("firmwareVersion")||_(a.firmware);d.textContent=x?"FW "+x:""}u.forEach(y=>{y.addEventListener("click",w=>{w.preventDefault(),at(y.getAttribute("data-section"))})}),M("section",m),M("live",v),M("pendingWrites",v),M("firmwareVersion",v),p(a.uptime,v),p(a.wifi,v),p(a.firmware,v),m(),v()}});var co=`
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
`;S("status-card",co);var po=e=>`
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
`,va=z({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:po,methods:{update(e){this.motorDriversOn=q(a.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=q(a.fault)?"FAULT":"OK",this.connOn=C("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let r={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},o=()=>e.update(r);p(a.drivers,o),p(a.fault,o),M("live",o),r.sw.onclick=()=>{De(!e.motorDriversOn)},o()}});var go=`
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
`;S("connectivity-card",go);var uo=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Sa=z({tag:"connectivity-card",render:uo,onMount(e,t){let r=t.querySelector(".cc-ip"),o=t.querySelector(".cc-ssid"),s=t.querySelector(".cc-mac"),n=t.querySelector(".cc-up");function i(){r.textContent=_(a.ip)||"---",o.textContent=_(a.ssid)||"---",s.textContent=_(a.mac)||"---",n.textContent=Oe(h(a.uptime))}p(a.ip,i),p(a.ssid,i),p(a.mac,i),p(a.uptime,i),i()}});var Ye="http://www.w3.org/2000/svg",Lt=220,Je=132,ee=10,bo=10,mo=24,J=34,we=Lt-J-bo,se=Je-ee-mo,fo=360,vo=`
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
`;S("graph-widgets",vo);var xo=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function Ct(e,t,r){if(!e.length)return"";let o=Math.max(.001,r-t),s=e.length>1?we/(e.length-1):0,n="";for(let i=0;i<e.length;i++){let d=J+s*i,u=ee+(1-(e[i]-t)/o)*se;n+=(i?" L ":"M ")+d.toFixed(2)+" "+u.toFixed(2)}return n}function ue(e,t,r){let o=document.createElementNS(Ye,e);return t&&Object.keys(t).forEach(s=>{o.setAttribute(s,t[s])}),r!=null&&(o.textContent=r),o}function ho(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"C":"---"}function yo(e){return e<=0?"now":e>=60?"-"+Math.round(e/60)+"h":"-"+Math.round(e)+"m"}function wo(e,t,r,o){let s="rgba(143, 176, 230, 0.42)",n="rgba(143, 176, 230, 0.16)",d=[{x:J,ratio:0},{x:J+we/2,ratio:.5},{x:J+we,ratio:1}];e.appendChild(ue("line",{x1:J,y1:ee,x2:J,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"})),e.appendChild(ue("line",{x1:J,y1:ee+se,x2:J+we,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"}));for(let u=0;u<3;u++){let m=u/2,v=ee+m*se,y=r-(r-t)*m;e.appendChild(ue("line",{x1:J,y1:v,x2:J+we,y2:v,stroke:n,"stroke-width":"1",class:"graph-grid"})),e.appendChild(ue("text",{x:J-5,y:v+3,"text-anchor":"end",class:"graph-tick-label"},ho(y,o)))}d.forEach(u=>{let m=fo*(1-u.ratio);e.appendChild(ue("text",{x:u.x,y:Je-6,"text-anchor":u.ratio===0?"start":u.ratio===1?"end":"middle",class:"graph-tick-label"},yo(m)))}),e.appendChild(ue("text",{x:5,y:ee+se/2,transform:"rotate(-90 5 "+(ee+se/2).toFixed(2)+")","text-anchor":"middle",class:"graph-axis-label"},o==="%"?"Demand":"Temp"))}function _o(e,t,r){let o=e.concat(t||[]).filter(d=>Number.isFinite(d));if(!o.length)return r==="%"?{min:0,max:100}:{min:0,max:10};let s=Math.min.apply(null,o),n=Math.max.apply(null,o);if(r==="%"&&(s=Math.max(0,s),n=Math.min(100,n)),s===n){let d=r==="%"?5:.5;s-=d,n+=d}let i=(n-s)*.08;return s-=i,n+=i,r==="%"&&(s=Math.max(0,s),n=Math.min(100,n)),{min:s,max:n}}function At(e,t,r,o,s,n){e.innerHTML="",e.setAttribute("viewBox","0 0 "+Lt+" "+Je),e.setAttribute("preserveAspectRatio","none");let i=_o(t,o,n);wo(e,i.min,i.max,n);let d=Ct(t,i.min,i.max);if(d){let m=document.createElementNS(Ye,"path");m.setAttribute("d",d),m.setAttribute("fill","none"),m.setAttribute("stroke",r),m.setAttribute("stroke-width","2.2"),m.setAttribute("stroke-linecap","round"),m.setAttribute("stroke-linejoin","round"),e.appendChild(m)}let u=o&&o.length?Ct(o,i.min,i.max):"";if(u){let m=document.createElementNS(Ye,"path");m.setAttribute("d",u),m.setAttribute("fill","none"),m.setAttribute("stroke",s),m.setAttribute("stroke-width","2"),m.setAttribute("stroke-linecap","round"),m.setAttribute("stroke-linejoin","round"),e.appendChild(m)}}var zo="var(--accent)",So="var(--blue)",ko="var(--blue)",La=z({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:xo,onMount(e,t){let r=t.querySelector(".gw-dt"),o=t.querySelector(".gw-demand-text"),s=t.querySelector(".gw-flow"),n=t.querySelector(".gw-demand");function i(){let d=C("historyFlow"),u=C("historyReturn"),m=C("historyDemand"),v=d.length?d[d.length-1]:null,y=u.length?u[u.length-1]:null,w=m.length?m[m.length-1]:null;r&&s&&(r.textContent=v!=null&&y!=null?(v-y).toFixed(1)+" C":"---",At(s,d,zo,u,So,"C")),o&&n&&(o.textContent=w!=null?Math.round(w)+"%":"---",At(n,m,ko,null,null,"%"))}M("historyFlow",i),M("historyReturn",i),M("historyDemand",i),i()}});var ne={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},Ft=24*3600,ze=18,Qe=4,_e=54,Pe=20,Se=4,qe=Q*(ze+Qe)-Qe+Se+Pe,Eo=`
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
`;S("zone-state-timeline",Eo);var Co=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Ao(e,t){if(!e||!e.entries||e.entries.length===0)return null;let r=e.entries,o=e.uptime_s||t||0,s=o-Ft,n=1e3,i=n-_e;function d(c){let x=(c-s)/Ft;return _e+Math.max(0,Math.min(1,x))*i}let u="http://www.w3.org/2000/svg",m=document.createElementNS(u,"svg");m.setAttribute("viewBox","0 0 "+n+" "+qe),m.classList.add("timeline-svg");let v=document.createElementNS(u,"rect");v.setAttribute("x",_e),v.setAttribute("y",Se),v.setAttribute("width",i),v.setAttribute("height",qe-Se-Pe),v.setAttribute("fill","rgba(10,24,46,0.55)"),v.setAttribute("rx","4"),m.appendChild(v);let y=[6,12,18,24];for(let c of y){let x=o-c*3600,k=d(x),b=document.createElementNS(u,"line");b.setAttribute("x1",k),b.setAttribute("y1",Se),b.setAttribute("x2",k),b.setAttribute("y2",qe-Pe),b.setAttribute("stroke","rgba(120,168,255,.12)"),b.setAttribute("stroke-width","1"),m.appendChild(b)}for(let c=0;c<Q;c++){let x=Se+c*(ze+Qe),k=document.createElementNS(u,"rect");k.setAttribute("x",_e),k.setAttribute("y",x),k.setAttribute("width",i),k.setAttribute("height",ze),k.setAttribute("fill",c%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),m.appendChild(k);let b=document.createElementNS(u,"text");b.setAttribute("x",_e-4),b.setAttribute("y",x+ze/2+1),b.setAttribute("text-anchor","end"),b.setAttribute("dominant-baseline","middle"),b.setAttribute("fill","rgba(191,211,245,.65)"),b.setAttribute("font-size","9.5"),b.setAttribute("font-family","Montserrat, sans-serif"),b.setAttribute("font-weight","600"),b.textContent="Z"+(c+1),m.appendChild(b);let F=r.filter(A=>A[0]>=s).map(A=>({t:A[0],state:A[c+1]}));if(F.length===0)continue;let P=F[0].t,R=F[0].state,I=(A,D,N)=>{if(N===255)return;let H=ne[N]||ne[255];if(H.color==="transparent")return;let G=d(A),Y=d(D),K=Math.max(1,Y-G),j=document.createElementNS(u,"rect");j.setAttribute("x",G),j.setAttribute("y",x+1),j.setAttribute("width",K),j.setAttribute("height",ze-2),j.setAttribute("fill",H.color),j.setAttribute("rx","2"),j.setAttribute("opacity","0.88"),m.appendChild(j)};for(let A=1;A<F.length;A++){let D=F[A];D.state!==R&&(I(P,D.t,R),P=D.t,R=D.state)}I(P,o,R)}let w=qe-Pe+14,f=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let c of f){let x=o-c.hoursAgo*3600,k=d(x),b=document.createElementNS(u,"text");b.setAttribute("x",k),b.setAttribute("y",w),b.setAttribute("text-anchor",c.hoursAgo===0?"end":"middle"),b.setAttribute("fill","rgba(191,211,245,.45)"),b.setAttribute("font-size","9"),b.setAttribute("font-family","Montserrat, sans-serif"),b.textContent=c.label,m.appendChild(b)}return m}function Lo(e){e.innerHTML="";let t=[{code:5,...ne[5]},{code:6,...ne[6]},{code:0,...ne[0]},{code:1,...ne[1]},{code:7,...ne[7]},{code:2,...ne[2]}];for(let r of t){let o=document.createElement("div");o.className="tl-legend-item",o.innerHTML='<span class="tl-legend-dot" style="background:'+r.color+'"></span>'+r.label,e.appendChild(o)}}var Oa=z({tag:"zone-state-timeline",render:Co,onMount(e,t){let r=t.querySelector(".tl-body"),o=t.querySelector(".timeline-legend");Lo(o);function s(){let n=C("zoneStateHistory"),i=(()=>{let u=C&&C("zoneStateHistory");return u&&u.uptime_s||Number(Date.now()/1e3)|0})();if(r.innerHTML="",!n||!n.entries||n.entries.length===0){let u=document.createElement("div");u.className="timeline-empty",u.textContent="No history yet \u2014 data accumulates every 5 minutes.",r.appendChild(u);return}let d=Ao(n,i);d&&r.appendChild(d)}M("zoneStateHistory",s),M("zoneNames",s),s()}});var Fo=`
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
`;S("zone-grid",Fo);var Mo=()=>'<div class="zone-grid"></div>',Ha=z({tag:"zone-grid",render:Mo,onMount(e,t){for(let r=1;r<=6;r++)t.appendChild(O("zone-card",{zone:r}))}});var No=`
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
`;S("zone-card",No);var Do=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${de(e.zone)}</div>
		<div class="zc-friendly">${re(e.zone)||"---"}</div>
	</div>
`,Va=z({tag:"zone-card",state:e=>({zone:e.zone}),render:Do,onMount(e,t){let r=e.zone,o=l.temp(r),s=l.state(r),n=l.enabled(r),i=t.querySelector(".zc-state-label"),d=t.querySelector(".zc-dot"),u=t.querySelector(".zc-zone-name"),m=t.querySelector(".zc-friendly");function v(){let y=q(n),w=String(_(s)||"").toUpperCase()||"OFF",f=C("selectedZone")===r,c=re(r);u.textContent=de(r),m.textContent=c||W(h(o)),i.textContent=y?w:"OFF";let x=y?w:"OFF",k=x==="HEATING"?"#f2c77b":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff7676":"#7D8BA7",b=x==="HEATING"?"#EEA111":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";i.style.color=k,d.style.background=b,d.style.boxShadow=x==="HEATING"?"0 0 5px rgba(238,161,17,.6)":x==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",f),t.classList.toggle("disabled",!y),t.classList.toggle("zs-heating",y&&w==="HEATING"),t.classList.toggle("zs-idle",y&&w!=="HEATING"),t.classList.toggle("zs-off",!y)}t.addEventListener("click",()=>{nt(r)}),p(o,v),p(s,v),p(n,v),M("selectedZone",v),M("zoneNames",v),v()}});var To=`
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
`;S("zone-detail",To);var Oo=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${de(e.zone)}</div>
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
`,en=z({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Oo,methods:{update(e,t){let r=C("selectedZone"),o=String(_(l.state(r))||"").toUpperCase(),s=q(l.enabled(r));this.zone=r,e.dataset.zone=String(r),t.title.textContent=de(r),t.setpoint.textContent=W(h(l.setpoint(r))),t.temp.textContent=W(h(l.temp(r))),t.ret.textContent=W(h("sensor-manifold_return_temperature")),t.valve.textContent=ge(h(l.valve(r)));let n=t.badge;n.textContent=s?o||"IDLE":"DISABLED";let i=s?o==="HEATING"?"badge-heating":o==="IDLE"?"badge-idle":o==="FAULT"?"badge-fault":"":"badge-disabled";n.className="zd-badge"+(i?" "+i:""),t.toggleRow.classList.toggle("is-on",s),t.toggle.classList.toggle("on",s)},incSetpoint(){let e=this.zone,t=h(l.setpoint(e))||20;je(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=h(l.setpoint(e))||20;je(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=q(l.enabled(e));bt(e,!t)}},onMount(e,t){let r={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggleRow:t.querySelector(".zd-toggle-row"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};r.inc.onclick=()=>e.incSetpoint(),r.dec.onclick=()=>e.decSetpoint(),r.toggle.onclick=()=>e.toggleEnabled();let o=()=>e.update(t,r),s=n=>{let i=C("selectedZone");(n===l.temp(i)||n===l.setpoint(i)||n===l.valve(i)||n===l.state(i)||n===l.enabled(i))&&o()};for(let n=1;n<=6;n++)p(l.temp(n),s),p(l.setpoint(n),s),p(l.valve(n),s),p(l.state(n),s),p(l.enabled(n),s);p("sensor-manifold_return_temperature",o),M("selectedZone",o),o()}});var qo=`
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

.zone-sensor-card .ble-row {
  display: flex;
  gap: 6px;
  align-items: center;
}
.zone-sensor-card .ble-row .txt {
  flex: 1;
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
`;S("zone-sensor-card",qo);var Po=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
      <div class="cfg-row zs-row-ble">
        <span class="lbl">BLE Sensor</span>
        <span class="lbl-help">Pair a nearby BTHome sensor (Shelly BLU H&T) or enter MAC manually.</span>
        <div class="ble-row">
          <input class="txt zs-ble" maxlength="17" placeholder="AA:BB:CC:DD:EE:FF">
          <button class="btn-scan zs-scan">Scan</button>
        </div>
        <div class="ble-scan-list zs-scan-list" style="display:none"></div>
      </div>
      <div class="cfg-row">
        <span class="lbl">Sync To Zone</span>
        <span class="lbl-help">Mirror target and control state from another zone.</span>
        <select class="sel zs-sync"></select>
      </div>
    </div>
  `};function Ro(e,t){let r=e.value,o="<option>None</option>";for(let s=1;s<=6;s++)s!==t&&(o+="<option>Zone "+s+"</option>");e.innerHTML=o,e.value=r||"None"}function Ho(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Io(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function Zo(e,t){let r="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==r&&(e.innerHTML=r),e.value=t}var ln=z({tag:"zone-sensor-card",render:Po,onMount(e,t){let r=t.querySelector(".zs-probe"),o=t.querySelector(".zs-source"),s=t.querySelector(".zs-ble"),n=t.querySelector(".zs-sync"),i=t.querySelector(".zs-row-ble"),d=t.querySelector(".zs-scan"),u=t.querySelector(".zs-scan-list"),m=0;function v(){return C("selectedZone")}function y(){let f=v();m!==f&&(Ro(n,f),m=f,u.style.display="none");let c=_(l.probe(f)),x=String(_(l.tempSource(f))||""),k=Ho(x),b=_(l.syncTo(f))||"None",F=_(l.ble(f))||"";c&&(r.value=c),Zo(o,k),n.value=b,document.activeElement!==s&&(s.value=F),i.style.display=k==="BLE Sensor"?"":"none"}function w(f){let c=v();(f===l.probe(c)||f===l.tempSource(c)||f===l.syncTo(c)||f===l.ble(c))&&y()}d.addEventListener("click",()=>{d.disabled||(d.disabled=!0,d.textContent="\u2026",u.style.display="",u.innerHTML='<div class="scan-msg">Scanning\u2026</div>',fetch("/api/hv6/v1/ble-scan").then(f=>f.json()).then(f=>{if(d.disabled=!1,d.textContent="Scan",!f.ok||!f.sensors||f.sensors.length===0){u.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let c=v(),x=(_(l.ble(c))||"").toUpperCase(),k="";for(let b of f.sensors){let F=b.mac.toUpperCase(),P=b.temp_c!=null?b.temp_c.toFixed(1)+"\xB0C":"\u2014",R=b.rssi!=null?b.rssi+" dBm":"",I=b.age_s<60?b.age_s+"s ago":Math.round(b.age_s/60)+"m ago",A="";F===x?A='<span class="ble-badge">assigned to this zone</span>':b.zone>0&&(A='<span class="ble-badge">zone '+b.zone+"</span>"),k+=`<div class="ble-scan-item">
              <div>
                <div class="ble-mac">${F}</div>
                <div class="ble-meta">${P} &nbsp;${R} &nbsp;${I}</div>
                ${A}
              </div>
              <button class="btn-assign" data-mac="${F}">Assign</button>
            </div>`}u.innerHTML=k,u.querySelectorAll(".btn-assign").forEach(b=>{b.addEventListener("click",()=>{let F=b.dataset.mac;s.value=F,xe(c,"zone_ble_mac",F),u.style.display="none"})})}).catch(()=>{d.disabled=!1,d.textContent="Scan",u.innerHTML='<div class="scan-msg">Scan failed. Check device connectivity.</div>'}))}),r.addEventListener("change",()=>{pe(v(),"zone_probe",r.value)}),o.addEventListener("change",()=>{pe(v(),"zone_temp_source",Io(o.value))}),n.addEventListener("change",()=>{pe(v(),"zone_sync_to",n.value)}),s.addEventListener("change",()=>{xe(v(),"zone_ble_mac",s.value)}),M("selectedZone",y);for(let f=1;f<=6;f++)p(l.probe(f),w),p(l.tempSource(f),w),p(l.syncTo(f),w),p(l.ble(f),w);y()}});var Bo=`
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
`;S("zone-room-card",Bo);var Wo=()=>`
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
`,mn=z({tag:"zone-room-card",render:Wo,onMount(e,t){let r=t.querySelector(".zr-friendly"),o=t.querySelector(".zr-area"),s=t.querySelector(".zr-spacing"),n=t.querySelector(".zr-pipe"),i=t.querySelectorAll(".wall-btn");function d(){return C("selectedZone")}function u(){let v=d();document.activeElement!==r&&(r.value=re(v)||""),document.activeElement!==o&&(o.value=h(l.area(v))!=null?String(h(l.area(v))):""),document.activeElement!==s&&(s.value=h(l.spacing(v))!=null?String(h(l.spacing(v))):""),n.value=_(l.pipeType(v))||"Unknown";let y=_(l.exteriorWalls(v))||"None",w=y==="None"?[]:y.split(",").filter(Boolean);i.forEach(f=>{let c=f.dataset.wall;f.classList.toggle("active",c==="None"?w.length===0:w.includes(c))})}function m(v){let y=d();(v===l.area(y)||v===l.spacing(y)||v===l.pipeType(y)||v===l.exteriorWalls(y))&&u()}r.addEventListener("change",()=>{lt(d(),r.value)}),o.addEventListener("change",()=>{he(d(),"zone_area_m2",o.value)}),s.addEventListener("change",()=>{he(d(),"zone_pipe_spacing_mm",s.value||"200")}),n.addEventListener("change",()=>{pe(d(),"zone_pipe_type",n.value)}),i.forEach(v=>{v.addEventListener("click",()=>{let y=v.dataset.wall,w=_(l.exteriorWalls(d()))||"None",f=w==="None"?[]:w.split(",").filter(Boolean);if(y==="None")f=[];else{let x=f.indexOf(y);x>=0?f.splice(x,1):f.push(y)}let c=["N","S","E","W"].filter(x=>f.includes(x));xe(d(),"zone_exterior_walls",c.length?c.join(","):"None")})}),M("selectedZone",u),M("zoneNames",u);for(let v=1;v<=6;v++)p(l.area(v),m),p(l.spacing(v),m),p(l.pipeType(v),m),p(l.exteriorWalls(v),m);u()}});var jo=`
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
`;S("flow-diagram",jo);var te=6,Ot=[60,126,192,258,324,390],Ie=225,be=36,Ee=160,Re=90,ke=be+Ee,oe=640,$o=11,Ke=6,et=24,Ce=oe+20,Mt=oe+200,Nt=oe+360,Dt=oe+420,qt="#7D8BA7",Pt="#6C7892",Vo="#8FCBFF",Go="#BCDFFF",Uo="#E4D092",Xo="#F2B74C",Yo="#8FCBFF",Jo="#D8E7FF",Qo="#7D8BA7",Tt="#B7CBF0",tt="#6C7892",He="#A3B6D9",Ko="#8EA4CD",er="#42A5F5",tr="#66BB6A",or="#EF5350";function Ze(e,t,r){var o=Ie+(e-2.5)*$o,s=Ot[e],n=oe-ke,i=ke+n*.33,d=ke+n*.67;return"M"+ke+" "+(o-t).toFixed(1)+" C"+i+" "+(o-t).toFixed(1)+" "+d+" "+(s-r).toFixed(1)+" "+oe+" "+(s-r).toFixed(1)+" L"+oe+" "+(s+r).toFixed(1)+" C"+d+" "+(s+r).toFixed(1)+" "+i+" "+(o+t).toFixed(1)+" "+ke+" "+(o+t).toFixed(1)+"Z"}function rr(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let r=Number(t[1]);return Number.isFinite(r)&&r>=1&&r<=8?r:null}function ar(e){let t=String(re(e)||"").trim();if(!t)return"";let r=t.toUpperCase();return r.length>18?r.slice(0,17)+"\u2026":r}function nr(e,t){return t?e==null||Number.isNaN(e)?Pt:e<.15?Vo:e<.4?Go:e<.7?Uo:Xo:qt}function sr(){var e=1160,t=460,r=Ie-Re/2,o=[];o.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),o.push("<defs>"),o.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),o.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),o.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var s=1;s<=te;s++)o.push('<linearGradient id="rg'+s+'" x1="0" y1="0" x2="1" y2="0">'),o.push('<stop id="rgs'+s+'" offset="0%" stop-color="#EEA111"/>'),o.push('<stop id="rga'+s+'" offset="100%" stop-color="#53A8FF"/>'),o.push("</linearGradient>");o.push("</defs>"),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),o.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var n=1;n<=te;n++){var i=Ze(n-1,Ke,et);o.push('<path d="'+i+'" fill="#1E2233" opacity="0.9"/>')}for(n=1;n<=te;n++){var d=Ze(n-1,Ke,et);o.push('<path id="fd-path-'+n+'" d="'+d+'" fill="url(#rg'+n+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}o.push('<line x1="'+oe+'" y1="36" x2="'+oe+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var u=5,m=be-u;for(o.push('<rect x="0" y="'+r+'" width="'+m+'" height="'+Re+'" fill="url(#lbgrad)" rx="4"/>'),o.push('<rect x="'+be+'" y="'+r+'" width="'+Ee+'" height="'+Re+'" rx="6" fill="#EEA111"/>'),o.push('<text x="'+(be+Ee/2)+'" y="'+(Ie-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),o.push('<text id="fd-flow-temp" x="'+(be+Ee/2)+'" y="'+(Ie+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),o.push('<text id="fd-ret-temp" x="'+(be+Ee/2)+'" y="'+(r+Re+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),o.push('<text x="'+Ce+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">ZONE</text>'),o.push('<text x="'+Mt+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">TEMP</text>'),o.push('<text x="'+Nt+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">FLOW</text>'),o.push('<text x="'+Dt+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">RET</text>'),n=1;n<=te;n++){var v=Ot[n-1];o.push('<text id="fd-zn'+n+'" x="'+Ce+'" y="'+(v+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+n+"</text>"),o.push('<text id="fd-zf'+n+'" x="'+Ce+'" y="'+(v+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),o.push('<text id="fd-zsp'+n+'" x="'+(Ce+82)+'" y="'+(v+18)+'" font-size="11" fill="'+tt+'" font-weight="600" font-family="var(--mono)"></text>'),o.push('<text id="fd-zt'+n+'" x="'+Mt+'" y="'+(v+10)+'" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),o.push('<text id="fd-zv'+n+'" x="'+Nt+'" y="'+(v+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),o.push('<text id="fd-zr'+n+'" x="'+Dt+'" y="'+(v+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return o.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Ko+'" letter-spacing="3">\u0394T Flow-Return</text>'),o.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),o.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+te+" ZONES - HEATVALVE</text>"),o.push("</svg>"),'<div class="flow-wrap">'+o.join("")+"</div>"}var ir=()=>`<div class="flow-wrap">${sr()}</div>`;z({tag:"flow-diagram",render:ir,onMount(e,t){let r={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(te+1)};for(let s=1;s<=te;s++)r.zones[s]={textTemp:t.querySelector("#fd-zt"+s),textSetpoint:t.querySelector("#fd-zsp"+s),textFlow:t.querySelector("#fd-zv"+s),textRet:t.querySelector("#fd-zr"+s),label:t.querySelector("#fd-zn"+s),friendly:t.querySelector("#fd-zf"+s),path:t.querySelector("#fd-path-"+s)};function o(){let s=h(a.flow),n=h(a.ret),i=r.flowEl,d=r.retEl,u=r.dtEl;if(i.textContent=W(s),d.textContent="RET "+W(n),s!=null&&n!=null){let m=Number(s)-Number(n);u.textContent=m.toFixed(1)+"\xB0C",u.setAttribute("fill",m<3?er:m>8?or:tr)}else u.textContent="---";for(let m=1;m<=te;m++){let v=h(l.temp(m)),y=h(l.setpoint(m)),w=h(l.valve(m)),f=q(l.enabled(m)),c=String(_(l.tempSource(m))||"Local Probe"),x=rr(_(l.probe(m))||""),k=x?h(l.probeTemp(x)):null,b=r.zones[m],F=b.textTemp,P=b.textSetpoint,R=b.textFlow,I=b.textRet,A=b.label,D=b.friendly,N=b.path,H=w!=null?Math.max(0,Math.min(100,Number(w)))/100:0;A.textContent="ZONE "+m;let G=ar(m);D.textContent=G||"---",A.setAttribute("fill",f?Jo:Qo),D.setAttribute("fill",f?Tt:tt),P.setAttribute("fill",f?Tt:tt);let Y=D.getComputedTextLength?D.getComputedTextLength():0;P.setAttribute("x",String(Ce+Y+8));let K=W(v),j=y!=null?W(y):null;if(F.textContent=K,P.textContent=j?"("+j+")":"",R.textContent=ge(w),R.setAttribute("fill",nr(H,f)),c!=="Local Probe"&&k!=null&&!Number.isNaN(Number(k))?(I.textContent=W(k),I.setAttribute("fill",f?Yo:qt)):(I.textContent="---",I.setAttribute("fill",Pt)),!f)N.setAttribute("d",Ze(m-1,1,2)),N.setAttribute("fill","#2A2D38"),N.setAttribute("opacity","0.4");else{let Bt=Math.max(3,H*et),Wt=Math.max(1.5,H*Ke);N.setAttribute("d",Ze(m-1,Wt,Bt)),N.setAttribute("fill","url(#rg"+m+")"),N.setAttribute("opacity","1")}}}p(a.flow,o),p(a.ret,o),M("zoneNames",o);for(let s=1;s<=te;s++)p(l.temp(s),o),p(l.setpoint(s),o),p(l.valve(s),o),p(l.enabled(s),o),p(l.probe(s),o),p(l.tempSource(s),o);for(let s=1;s<=8;s++)p(l.probeTemp(s),o);o()}});var lr=`
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
}`;S("diag-i2c",lr);var dr=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,En=z({tag:"diag-i2c",render:dr,onMount(e,t){let r=t.querySelector("#i2c-result");function o(){r.textContent=C("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{mt()}),M("i2cResult",o),o()}});var cr=`
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
`;S("diag-zone",cr);function pr(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function Rt(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Ht(e){return e!=null?Number(e).toFixed(0):"---"}function gr(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var ur=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
  `},Dn=z({tag:"diag-zone",render:ur,onMount(e,t){function r(s){let n=String(_(l.state(s))||"").toUpperCase()||"OFF",i=q(l.enabled(s)),d=t.querySelector('[data-dz-state="'+s+'"]');d.textContent=i?n:"OFF",d.className="dz-state-badge"+(i?" "+pr(n):""),t.querySelector('[data-dz-temp="'+s+'"]').textContent=W(h(l.temp(s))),t.querySelector('[data-dz-valve="'+s+'"]').textContent=ge(h(l.valve(s))),t.querySelector('[data-dz-ret="'+s+'"]').textContent=W(h(a.ret)),t.querySelector('[data-dz-orip="'+s+'"]').textContent=Ht(h(l.motorOpenRipples(s))),t.querySelector('[data-dz-crip="'+s+'"]').textContent=Ht(h(l.motorCloseRipples(s))),t.querySelector('[data-dz-ofac="'+s+'"]').textContent=Rt(h(l.motorOpenFactor(s))),t.querySelector('[data-dz-cfac="'+s+'"]').textContent=Rt(h(l.motorCloseFactor(s))),t.querySelector('[data-dz-ph="'+s+'"]').textContent=gr(h(l.preheatAdvance(s)));let u=String(_(l.motorLastFault(s))||"").toUpperCase(),m=u&&u!=="NONE"&&u!=="OK",v=t.querySelector('[data-dz-faultrow="'+s+'"]');v.style.display=m?"flex":"none",m&&(t.querySelector('[data-dz-fault="'+s+'"]').textContent=u)}for(let s=1;s<=6;s++){let n=s,i=()=>r(n);p(l.state(n),i),p(l.enabled(n),i),p(l.temp(n),i),p(l.valve(n),i),p(a.ret,i),p(l.motorOpenRipples(n),i),p(l.motorCloseRipples(n),i),p(l.motorOpenFactor(n),i),p(l.motorCloseFactor(n),i),p(l.preheatAdvance(n),i),p(l.motorLastFault(n),i),r(n)}function o(){let s=t.querySelector("[data-preheat-badge]"),n=s.querySelector(".card-title-preheat-dot"),i=s.querySelector("span:last-child"),u=(_(a.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";s.classList.toggle("on",u),s.classList.toggle("off",!u),n.classList.toggle("on",u),n.classList.toggle("off",!u),i.textContent=u?"Preheat: On":"Preheat: Off"}p(a.simplePreheatEnabled,o),o()}});var br=`
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
`;S("diag-activity",br);var mr=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function fr(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let r="";for(let o=t.length-1;o>=0;o--)r+='<div class="diag-log-item"><span class="diag-log-time">'+t[o].time+'</span><span class="diag-log-msg">'+t[o].msg+"</span></div>";e.innerHTML=r}var Rn=z({tag:"diag-activity",render:mr,onMount(e,t){let r=t.querySelector(".diag-log");function o(){fr(r,dt())}M("activityLog",o),o()}});var vr=`
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
`;S("diag-manual-badge",vr);var xr=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Wn=z({tag:"diag-manual-badge",render:xr,onMount(e,t){let r=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function o(){let s=!!C("manualMode");r&&r.classList.toggle("on",s)}M("manualMode",o),o()}});var hr=`
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
`;S("diag-zone-motor",hr);var yr=e=>{let t=e.zone||C("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},Yn=z({tag:"diag-zone-motor-card",render:yr,onMount(e,t){let r=Number(e.zone||C("selectedZone")||1),o=!!C("manualMode"),s=t.querySelector(".manual-mode-toggle"),n=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),d=t.querySelector(".motor-target-input"),u=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),v=t.querySelector(".motor-stop-btn");function y(c){o=!!c,s&&(s.classList.toggle("on",o),s.setAttribute("aria-checked",o?"true":"false")),n&&n.classList.toggle("locked",!o),[i,d,u,m,v].forEach(x=>{x&&(x.disabled=!o)})}function w(){let c=!o;if(y(c),c){Ve(!0);for(let x=1;x<=6;x++)$e(x)}else Ve(!1)}function f(){let c=h(l.motorTarget(r));d&&c!=null?d.value=Number(c).toFixed(0):d&&(d.value="0")}i==null||i.addEventListener("change",()=>{r=Number(i.value||1),f()}),s==null||s.addEventListener("click",w),s==null||s.addEventListener("keydown",c=>{c.key!==" "&&c.key!=="Enter"||(c.preventDefault(),w())});for(let c=1;c<=6;c++)p(l.motorTarget(c),f);f(),y(o),M("manualMode",()=>{y(!!C("manualMode"))}),d==null||d.addEventListener("change",c=>{if(!o)return;let x=c.target.value;ft(r,x)}),u==null||u.addEventListener("click",()=>{o&&vt(r,1e4)}),m==null||m.addEventListener("click",()=>{o&&xt(r,1e4)}),v==null||v.addEventListener("click",()=>{o&&$e(r)})}});var wr=`
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
`;S("diag-zone-recovery",wr);var _r=e=>{let t=e.zone||C("selectedZone")||1,r="";for(let o=1;o<=6;o++)r+='<option value="'+o+'"'+(o===t?" selected":"")+">Zone "+o+"</option>";return`
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
  `},os=z({tag:"diag-zone-recovery-card",render:_r,onMount(e,t){let r=Number(e.zone||C("selectedZone")||1),o=t.querySelector(".recovery-zone-select"),s=t.querySelector(".recovery-fault-btn"),n=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn");o==null||o.addEventListener("change",()=>{r=Number(o.value||1)}),s==null||s.addEventListener("click",()=>{ht(r)}),n==null||n.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+r+"?")&&yt(r)}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+r+"?")&&wt(r)})}});var zr=`
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
`;S("settings-manifold-card",zr);var Sr=()=>{let e="";for(let r=1;r<=8;r++)e+="<option>Probe "+r+"</option>";let t="";for(let r=1;r<=8;r++)t+='<div class="probe-cell"><div class="probe-name">Probe '+r+'</div><div class="probe-temp" data-probe="'+r+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},cs=z({tag:"settings-manifold-card",render:Sr,onMount(e,t){let r=t.querySelector(".sm-type"),o=t.querySelector(".sm-flow"),s=t.querySelector(".sm-ret");function n(){r.value=_(a.manifoldType)||"NO (Normally Open)",o.value=_(a.manifoldFlowProbe)||"Probe 7",s.value=_(a.manifoldReturnProbe)||"Probe 8";for(let i=1;i<=8;i++){let d=t.querySelector('[data-probe="'+i+'"]'),u=h(l.probeTemp(i));d&&(d.textContent=W(u))}}r.addEventListener("change",()=>V("manifold_type",r.value)),o.addEventListener("change",()=>V("manifold_flow_probe",o.value)),s.addEventListener("change",()=>V("manifold_return_probe",s.value)),p(a.manifoldType,n),p(a.manifoldFlowProbe,n),p(a.manifoldReturnProbe,n);for(let i=1;i<=8;i++)p(l.probeTemp(i),n);n()}});var kr=`
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

.settings-card .absorb-badge {
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

.settings-card .absorb-badge.active {
  background: rgba(45,110,45,.36);
  color: #CBFFD0;
  border-color: rgba(100,255,100,.35);
}

.settings-card .num-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.settings-card .num-row .lbl {
  display: block;
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.settings-card .num-row .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
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
`;S("settings-control-card",kr);var Er=()=>`
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
      <div class="toggle-row">
        <span class="toggle-label">Preheat Absorption <span class="absorb-badge">idle</span></span>
        <div class="ui-toggle absorb-toggle" role="switch" aria-label="Toggle preheat absorption"></div>
      </div>
      <div class="num-row">
        <div>
          <span class="lbl">Absorb band (\xB0C)</span>
          <input class="inp absorb-band" type="number" min="0" max="5" step="0.1" placeholder="1.0" />
        </div>
        <div>
          <span class="lbl">Detect delta (\xB0C)</span>
          <input class="inp absorb-delta" type="number" min="2" max="25" step="0.5" placeholder="8.0" />
        </div>
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
`,vs=z({tag:"settings-control-card",render:Er,onMount(e,t){let r=t.querySelector(".drivers-toggle"),o=t.querySelector(".preheat-toggle"),s=r.closest(".toggle-row"),n=o.closest(".toggle-row");function i(){return q(a.drivers)}function d(){let b=i();r.classList.toggle("on",b),s.classList.toggle("is-on",b),r.setAttribute("aria-checked",b?"true":"false")}r.addEventListener("click",()=>{De(!i())}),p(a.drivers,d),d();function u(){let b=String(_(a.simplePreheatEnabled)||"").toLowerCase();return b==="on"||b==="true"||b==="1"||b==="enabled"}function m(){let b=u();o.classList.toggle("on",b),n.classList.toggle("is-on",b),o.setAttribute("aria-checked",b?"true":"false")}o.addEventListener("click",()=>{let b=!u();V("simple_preheat_enabled",b?"on":"off")}),p(a.simplePreheatEnabled,m),m();let v=t.querySelector(".absorb-toggle"),y=v.closest(".toggle-row"),w=t.querySelector(".absorb-badge"),f=t.querySelector(".absorb-band"),c=t.querySelector(".absorb-delta");function x(){let b=q(a.preheatAbsorbEnabled);v.classList.toggle("on",b),y.classList.toggle("is-on",b),v.setAttribute("aria-checked",b?"true":"false");let F=String(_(a.preheatAbsorbing)||"").toLowerCase()==="active";w.textContent=F?"active":"idle",w.classList.toggle("active",F)}v.addEventListener("click",()=>{let b=q(a.preheatAbsorbEnabled)?"off":"on";g(a.preheatAbsorbEnabled,{state:b}),V("preheat_absorb_enabled",b)});function k(){let b=h(a.preheatAbsorbBandC),F=h(a.preheatDetectDeltaC);document.activeElement!==f&&b!=null&&(f.value=b),document.activeElement!==c&&F!=null&&(c.value=F)}f.addEventListener("blur",()=>{let b=parseFloat(f.value);b>=0&&b<=5&&(g(a.preheatAbsorbBandC,{value:b}),B("preheat_absorb_band_c",b))}),c.addEventListener("blur",()=>{let b=parseFloat(c.value);b>=2&&b<=25&&(g(a.preheatDetectDeltaC,{value:b}),B("preheat_detect_delta_c",b))}),p(a.preheatAbsorbEnabled,x),p(a.preheatAbsorbing,x),p(a.preheatAbsorbBandC,k),p(a.preheatDetectDeltaC,k),x(),k(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ae("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ae("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ae("restart")})}});var Cr=`
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
`;S("settings-motor-calibration-card",Cr);var me=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:a.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:a.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:a.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:a.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:a.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:a.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:a.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:a.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:a.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:a.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:a.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:a.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Ar=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let r=0;r<me.length;r++){let o=me[r];t+='<div class="cfg-row"><span class="lbl">'+o.label+'</span><input type="number" class="txt smc-'+o.cls+'" value="0" step="0.1"><span class="unit">'+o.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function Lr(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function It(e,t){let r=Number(t);return Number.isFinite(r)?Lr(e)?String(Math.round(r)):r.toFixed(2):"0"}var Ss=z({tag:"settings-motor-calibration-card",render:Ar,onMount(e,t){let r=t.querySelector(".smc-profile"),o=t.querySelector(".smc-safe-runtime");function s(i){if(i==="HmIP VdMot"&&B("hmip_runtime_limit_seconds",40),i==="Generic"){let d=Number(h(a.genericRuntimeLimitSeconds));(!Number.isFinite(d)||d<=0)&&B("generic_runtime_limit_seconds",45)}}function n(){let i=_(a.motorProfileDefault)||"HmIP VdMot";r&&(r.value=i),o&&(i==="HmIP VdMot"?(o.value="40",o.disabled=!0):(o.value=It("generic_runtime_limit_seconds",h(a.genericRuntimeLimitSeconds)),o.disabled=!1));for(let d=0;d<me.length;d++){let u=me[d],m=t.querySelector(".smc-"+u.cls);m&&u.key!=="generic_runtime_limit_seconds"&&(m.value=It(u.key,h(u.id)))}}r&&(r.addEventListener("change",()=>{V("motor_profile_default",r.value),s(r.value)}),p(a.motorProfileDefault,n));for(let i=0;i<me.length;i++){let d=me[i],u=t.querySelector(".smc-"+d.cls);u&&(u.addEventListener("change",()=>{if(d.key==="generic_runtime_limit_seconds"){if((_(a.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;B("generic_runtime_limit_seconds",u.value);return}B(d.key,u.value)}),p(d.id,n))}p(a.genericRuntimeLimitSeconds,n),p(a.hmipRuntimeLimitSeconds,n),s(_(a.motorProfileDefault)||"HmIP VdMot"),n()}});var Fr=`
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
`;S("settings-helios-card",Fr);var Mr=()=>`
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
`,Ms=z({tag:"settings-helios-card",render:Mr,onMount(e,t){let r=t.querySelector(".helios-status-badge"),o=t.querySelector(".enable-row"),s=t.querySelector(".enable-toggle"),n=t.querySelector(".sh-host"),i=t.querySelector(".sh-port"),d=t.querySelector(".sh-cid"),u=t.querySelector(".sh-cid-note"),m=t.querySelector(".sh-poll"),v=t.querySelector(".sh-stale");function y(){let c=_(a.heliosStatus)||"offline";r.textContent=c,r.className="helios-status-badge "+c}function w(){let c=q(a.heliosEnabled);o.classList.toggle("is-on",c),o.classList.toggle("is-off",!c),s.setAttribute("aria-checked",c?"true":"false")}s.addEventListener("click",()=>{let c=q(a.heliosEnabled),k=!c?"on":"off";console.log(`[Helios] Toggle clicked: ${c?"on":"off"} -> ${k}`),g(a.heliosEnabled,{state:k}),V("helios_enabled",k).catch(b=>{console.error("[Helios] Failed to send toggle state to backend:",b),g(a.heliosEnabled,{state:c?"on":"off"})})}),n.addEventListener("blur",()=>{let c=n.value.trim();g(a.heliosHost,{state:c}),ye("helios_host",c).catch(x=>console.error("[Helios] Failed to update host:",x))}),d.addEventListener("blur",()=>{let c=d.value.trim();g(a.heliosControllerId,{state:c}),ye("helios_controller_id",c).catch(x=>console.error("[Helios] Failed to update controller_id:",x))}),i.addEventListener("blur",()=>{let c=parseInt(i.value,10);c>=1&&c<=65535&&(g(a.heliosPort,{value:c}),B("helios_port",c).catch(x=>console.error("[Helios] Failed to update port:",x)))}),m.addEventListener("blur",()=>{let c=parseInt(m.value,10);c>=5&&c<=3600&&(g(a.heliosPollIntervalS,{value:c}),B("helios_poll_interval_s",c).catch(x=>console.error("[Helios] Failed to update poll_interval_s:",x)))}),v.addEventListener("blur",()=>{let c=parseInt(v.value,10);c>=10&&c<=86400&&(g(a.heliosStaleAfterS,{value:c}),B("helios_stale_after_s",c).catch(x=>console.error("[Helios] Failed to update stale_after_s:",x)))});function f(){let c=_(a.heliosHost),x=_(a.heliosControllerId),k=_(a.heliosDeviceId)||"heatvalve-6",b=h(a.heliosPort),F=h(a.heliosPollIntervalS),P=h(a.heliosStaleAfterS);document.activeElement!==n&&c!=null&&(n.value=c),document.activeElement!==d&&(x!=null&&(d.value=x),d.placeholder=k,u.textContent="Leave blank to use device ID: "+k),document.activeElement!==i&&b!=null&&(i.value=b||8080),document.activeElement!==m&&F!=null&&(m.value=F||30),document.activeElement!==v&&P!=null&&(v.value=P||600)}p(a.heliosStatus,y),p(a.heliosEnabled,w),p(a.heliosHost,f),p(a.heliosControllerId,f),p(a.heliosDeviceId,f),p(a.heliosPort,f),p(a.heliosPollIntervalS,f),p(a.heliosStaleAfterS,f),y(),w(),f()}});var Nr=`
.settings-asgard-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-asgard-card .card-title {
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

.settings-asgard-card .cfg-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-bottom: 12px;
}

.settings-asgard-card .lbl {
  color: var(--text-secondary);
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  line-height: 1.2;
}

.settings-asgard-card .inp {
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

.settings-asgard-card .inp:focus {
  outline: 2px solid rgba(83,168,255,.6);
  outline-offset: 1px;
  border-color: rgba(83,168,255,.55);
}

.settings-asgard-card .row-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 12px;
  align-items: start;
}

.settings-asgard-card .row-2col .cfg-row {
  margin-bottom: 0;
}

.settings-asgard-card .enable-row {
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

.settings-asgard-card .enable-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.settings-asgard-card .enable-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.settings-asgard-card .enable-toggle {
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

.settings-asgard-card .enable-toggle::after {
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

.settings-asgard-card .enable-row.is-on .enable-toggle {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.settings-asgard-card .enable-row.is-on .enable-toggle::after {
  transform: translateX(22px);
  background: #0f213c;
}

.settings-asgard-card .section-title {
  color: var(--text-secondary);
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .8px;
  text-transform: uppercase;
  margin: 16px 0 10px;
}

.settings-asgard-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 4px;
  line-height: 1.4;
}

.settings-asgard-card .status-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 14px;
  font-size: .82rem;
  color: var(--text-secondary);
}

.settings-asgard-card .status-grid .val {
  color: var(--text);
  font-weight: 600;
}

.settings-asgard-card .status-grid .val.warn {
  color: #FFE9A0;
}

@media (max-width: 980px) {
  .settings-asgard-card .row-2col {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .settings-asgard-card .row-2col .cfg-row {
    margin-bottom: 0;
  }
}
`;S("settings-asgard-card",Nr);var Dr=()=>`
  <div class="settings-asgard-card">
    <div class="card-title">
      <span>Asgard / Ecodan Bridge</span>
      <span class="asgard-role-badge slave">slave</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Bridge enabled</span>
      <div class="enable-toggle sa-enable" role="switch" aria-label="Toggle Asgard bridge"></div>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Coordinator (pushes to Asgard)</span>
      <div class="enable-toggle sa-coord" role="switch" aria-label="Toggle coordinator role"></div>
    </div>

    <div class="section-title">Asgard</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Host</span>
        <input class="inp sa-host" type="text" placeholder="ecodan-heatpump.local" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Port</span>
        <input class="inp sa-port" type="number" min="1" max="65535" step="1" placeholder="80" />
      </div>
    </div>
    <div class="cfg-row">
      <span class="lbl">Number entity</span>
      <input class="inp sa-entity" type="text" maxlength="47" placeholder="virtual_thermostat_input_z1" />
      <span class="note">Asgard REST object_id receiving the weighted house temperature</span>
    </div>

    <div class="section-title">Peer board</div>
    <div class="row-2col">
      <div class="cfg-row">
        <span class="lbl">Peer host</span>
        <input class="inp sa-peer" type="text" placeholder="empty = single board" maxlength="63" />
      </div>
      <div class="cfg-row">
        <span class="lbl">Push interval (s)</span>
        <input class="inp sa-interval" type="number" min="5" max="3600" step="1" placeholder="30" />
      </div>
    </div>

    <div class="section-title">Status</div>
    <div class="status-grid">
      <span>Peer</span><span class="val sa-st-peer">n/a</span>
      <span>Last push</span><span class="val sa-st-push">\u2014</span>
      <span>Zones weighted</span><span class="val sa-st-zones">\u2014</span>
      <span>Last error</span><span class="val sa-st-err">\u2014</span>
    </div>
  </div>
`,Rs=z({tag:"settings-asgard-card",render:Dr,onMount(e,t){let r=t.querySelector(".asgard-role-badge"),o=t.querySelector(".sa-enable").closest(".enable-row"),s=t.querySelector(".sa-coord").closest(".enable-row"),n=t.querySelector(".sa-enable"),i=t.querySelector(".sa-coord"),d=t.querySelector(".sa-host"),u=t.querySelector(".sa-port"),m=t.querySelector(".sa-entity"),v=t.querySelector(".sa-peer"),y=t.querySelector(".sa-interval"),w=t.querySelector(".sa-st-peer"),f=t.querySelector(".sa-st-push"),c=t.querySelector(".sa-st-zones"),x=t.querySelector(".sa-st-err");function k(A,D,N,H,G){return A.addEventListener("click",()=>{let Y=q(N),K=Y?"off":"on";g(N,{state:K}),V(H,K).catch(j=>{console.error(`[Asgard] Failed to update ${G}:`,j),g(N,{state:Y?"on":"off"})})}),()=>{let Y=q(N);D.classList.toggle("is-on",Y),D.classList.toggle("is-off",!Y),A.setAttribute("aria-checked",Y?"true":"false")}}let b=k(n,o,a.asgardEnabled,"asgard_enabled","enabled"),F=k(i,s,a.asgardCoordinator,"asgard_coordinator","coordinator");function P(A,D,N){A.addEventListener("blur",()=>{let H=A.value.trim();g(D,{state:H}),ye(N,H).catch(G=>console.error(`[Asgard] Failed to update ${N}:`,G))})}P(d,a.asgardHost,"asgard_host"),P(m,a.asgardEntityName,"asgard_entity_name"),P(v,a.asgardPeerHost,"asgard_peer_host"),u.addEventListener("blur",()=>{let A=parseInt(u.value,10);A>=1&&A<=65535&&(g(a.asgardPort,{value:A}),B("asgard_port",A).catch(D=>console.error("[Asgard] Failed to update port:",D)))}),y.addEventListener("blur",()=>{let A=parseInt(y.value,10);A>=5&&A<=3600&&(g(a.asgardPushIntervalS,{value:A}),B("asgard_push_interval_s",A).catch(D=>console.error("[Asgard] Failed to update push_interval_s:",D)))});function R(){let A=_(a.asgardRole)||"slave";r.textContent=A,r.className="asgard-role-badge "+(A==="master"?"master":"slave");let D=_(a.asgardPeerStatus)||"n/a";w.textContent=D,w.classList.toggle("warn",D==="stale"||D==="unreachable");let N=h(a.asgardLastPushC),H=h(a.asgardLastPushAgeS);if(N!=null&&Number.isFinite(N)&&H!=null){let j=H<120?`${Math.round(H)}s ago`:`${Math.round(H/60)}m ago`;f.textContent=`${N.toFixed(2)}\xB0C (${j})`}else f.textContent="\u2014";let G=h(a.asgardLocalZones),Y=h(a.asgardPeerZones);c.textContent=G!=null?`${G} local + ${Y||0} peer`:"\u2014";let K=_(a.asgardLastError);x.textContent=K||"\u2014",x.classList.toggle("warn",!!K)}function I(){let A=_(a.asgardHost),D=_(a.asgardEntityName),N=_(a.asgardPeerHost),H=h(a.asgardPort),G=h(a.asgardPushIntervalS);document.activeElement!==d&&A!=null&&(d.value=A),document.activeElement!==m&&D!=null&&(m.value=D),document.activeElement!==v&&N!=null&&(v.value=N),document.activeElement!==u&&H!=null&&(u.value=H||80),document.activeElement!==y&&G!=null&&(y.value=G||30)}p(a.asgardEnabled,b),p(a.asgardCoordinator,F),p(a.asgardRole,R),p(a.asgardPeerStatus,R),p(a.asgardLastPushC,R),p(a.asgardLastPushAgeS,R),p(a.asgardLocalZones,R),p(a.asgardPeerZones,R),p(a.asgardLastError,R),p(a.asgardHost,I),p(a.asgardEntityName,I),p(a.asgardPeerHost,I),p(a.asgardPort,I),p(a.asgardPushIntervalS,I),b(),F(),R(),I()}});var Zt=[1,2,3,4,5,6],Tr=`
.settings-forecast-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.settings-forecast-card .card-title {
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

.settings-forecast-card .enable-row {
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

.settings-forecast-card .enable-label { font-size: .88rem; font-weight: 700; color: var(--text); }
.settings-forecast-card .enable-row.is-on { border-color: rgba(100,255,100,.4); background: rgba(45,110,45,.2); }

.settings-forecast-card .enable-toggle {
  width: 48px; height: 26px; border-radius: 999px;
  background: var(--control-bg-hover); position: relative; cursor: pointer;
  border: 1px solid var(--control-border); transition: background .2s ease, border-color .2s ease; flex-shrink: 0;
}
.settings-forecast-card .enable-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px;
  background: #dbe8ff; border-radius: 999px; transition: transform .2s ease;
}
.settings-forecast-card .enable-row.is-on .enable-toggle { background: rgba(121,209,126,.25); border-color: rgba(121,209,126,.5); }
.settings-forecast-card .enable-row.is-on .enable-toggle::after { transform: translateX(22px); background: #0f213c; }

.settings-forecast-card .section-title {
  color: var(--text-secondary); font-size: .76rem; font-weight: 700;
  letter-spacing: .8px; text-transform: uppercase; margin: 16px 0 10px;
}

.settings-forecast-card .row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 12px; }
.settings-forecast-card .lbl {
  display: block; color: var(--text-secondary); font-size: .74rem; font-weight: 700;
  letter-spacing: .45px; text-transform: uppercase; margin-bottom: 4px;
}
.settings-forecast-card .inp {
  width: 100%; box-sizing: border-box; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--text); border-radius: 10px; padding: 8px 10px; font-size: .88rem;
}

.settings-forecast-card .zone-table { width: 100%; border-collapse: collapse; font-size: .8rem; }
.settings-forecast-card .zone-table th {
  color: var(--text-secondary); font-size: .68rem; font-weight: 700; text-transform: uppercase;
  letter-spacing: .4px; text-align: center; padding: 4px 2px; font-weight: 700;
}
.settings-forecast-card .zone-table th:first-child { text-align: left; }
.settings-forecast-card .zone-table td { padding: 3px 2px; text-align: center; }
.settings-forecast-card .zone-table td:first-child { text-align: left; color: var(--text); font-weight: 600; white-space: nowrap; }
.settings-forecast-card .zone-table input {
  width: 100%; box-sizing: border-box; border: 1px solid var(--control-border);
  background: var(--control-bg); color: var(--text); border-radius: 8px; padding: 5px 4px; font-size: .8rem; text-align: center;
}
.settings-forecast-card .zone-table .offset-cell { font-weight: 700; color: var(--text-secondary); }
.settings-forecast-card .zone-table .offset-cell.active { color: #CBFFD0; }

.settings-forecast-card .note { color: var(--text-secondary); font-size: .75rem; margin-top: 6px; line-height: 1.4; }
`;S("settings-forecast-card",Tr);var Or=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td><input class="fc-wind" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-solar" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-lead" type="number" min="0" max="48" step="1" /></td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,qr=()=>`
  <div class="settings-forecast-card">
    <div class="card-title">
      <span>Forecast Preload</span>
      <span class="fc-badge">disabled</span>
    </div>

    <div class="enable-row is-off">
      <span class="enable-label">Wind preload enabled</span>
      <div class="enable-toggle fc-enable" role="switch" aria-label="Toggle forecast preload"></div>
    </div>

    <div class="section-title">Location</div>
    <div class="row-2col">
      <div><span class="lbl">Latitude</span><input class="inp fc-lat" type="number" min="-90" max="90" step="0.0001" placeholder="55.6761" /></div>
      <div><span class="lbl">Longitude</span><input class="inp fc-lon" type="number" min="-180" max="180" step="0.0001" placeholder="12.5683" /></div>
    </div>

    <div class="section-title">Model</div>
    <div class="row-2col">
      <div><span class="lbl">Load threshold</span><input class="inp fc-threshold" type="number" min="0.1" max="10" step="0.1" placeholder="1.0" /></div>
      <div><span class="lbl">Max offset (\xB0C)</span><input class="inp fc-maxoffset" type="number" min="0" max="3" step="0.1" placeholder="1.5" /></div>
    </div>

    <div class="section-title">Per-zone exposure</div>
    <table class="zone-table">
      <thead>
        <tr><th>Zone</th><th>Wind</th><th>Solar</th><th>Lead h</th><th>Now</th></tr>
      </thead>
      <tbody class="fc-zone-body">
        ${Zt.map(Or).join("")}
      </tbody>
    </table>
    <div class="note fc-note">Wind 0\u20131 = facade exposure \xB7 Solar 0\u20131 = passive gain relief \xB7 Lead h = hours of slab charging before a forecast load peak. Exterior walls (per zone, set in the zone sensor card) decide which wind directions count.</div>
  </div>
`,$s=z({tag:"settings-forecast-card",render:qr,onMount(e,t){let r=t.querySelector(".fc-badge"),o=t.querySelector(".enable-row"),s=t.querySelector(".fc-enable"),n=t.querySelector(".fc-lat"),i=t.querySelector(".fc-lon"),d=t.querySelector(".fc-threshold"),u=t.querySelector(".fc-maxoffset");s.addEventListener("click",()=>{let f=q(a.forecastEnabled),c=f?"off":"on";g(a.forecastEnabled,{state:c}),V("forecast_enabled",c).catch(x=>{console.error("[Forecast] toggle failed:",x),g(a.forecastEnabled,{state:f?"on":"off"})})});function m(f,c,x,k,b){f.addEventListener("blur",()=>{let F=parseFloat(f.value);!Number.isNaN(F)&&F>=k&&F<=b&&(g(x,{value:F}),B(c,F).catch(P=>console.error(`[Forecast] ${c} failed:`,P)))})}m(n,"forecast_latitude",a.forecastLatitude,-90,90),m(i,"forecast_longitude",a.forecastLongitude,-180,180),m(d,"forecast_load_threshold",a.forecastLoadThreshold,.1,10),m(u,"forecast_max_offset_c",a.forecastMaxOffsetC,0,3),t.querySelectorAll(".fc-zone-body tr").forEach(f=>{let c=parseInt(f.getAttribute("data-zone"),10),x=f.querySelector(".fc-wind"),k=f.querySelector(".fc-solar"),b=f.querySelector(".fc-lead"),F=(P,R,I,A,D)=>{P.addEventListener("blur",()=>{let N=parseFloat(P.value);!Number.isNaN(N)&&N>=A&&N<=D&&(g(I(c),{value:N}),he(c,R,N).catch(H=>console.error(`[Forecast] z${c} ${R} failed:`,H)))})};F(x,"zone_wind_exposure",a.windExposure,0,1),F(k,"zone_solar_gain",a.solarGain,0,1),F(b,"zone_thermal_lead_h",a.thermalLeadH,0,48)});function v(){let f=_(a.forecastStatus)||"disabled";r.textContent=f,r.className="fc-badge",f==="ok"?r.classList.add("ok"):(f==="stale"||f.indexOf("external")>=0)&&r.classList.add("external");let c=q(a.forecastEnabled);o.classList.toggle("is-on",c),o.classList.toggle("is-off",!c),s.setAttribute("aria-checked",c?"true":"false")}function y(){t.querySelectorAll(".fc-zone-body tr").forEach(f=>{let c=parseInt(f.getAttribute("data-zone"),10),x=f.querySelector(".fc-offset"),k=h(a.forecastOffset(c)),b=h(a.forecastPeakH(c));k!=null&&k>.01?(x.textContent=`+${k.toFixed(1)}\xB0`+(b!=null&&b>=0?` (${b}h)`:""),x.classList.add("active")):(x.textContent="\u2014",x.classList.remove("active"))})}function w(){let f=(c,x,k)=>{let b=h(x);document.activeElement!==c&&b!=null&&(c.value=b||k)};f(n,a.forecastLatitude,""),f(i,a.forecastLongitude,""),f(d,a.forecastLoadThreshold,1),f(u,a.forecastMaxOffsetC,1.5),t.querySelectorAll(".fc-zone-body tr").forEach(c=>{let x=parseInt(c.getAttribute("data-zone"),10);f(c.querySelector(".fc-wind"),a.windExposure(x),.5),f(c.querySelector(".fc-solar"),a.solarGain(x),.3),f(c.querySelector(".fc-lead"),a.thermalLeadH(x),4)})}p(a.forecastStatus,v),p(a.forecastEnabled,v),p(a.forecastLatitude,w),p(a.forecastLongitude,w),p(a.forecastLoadThreshold,w),p(a.forecastMaxOffsetC,w),Zt.forEach(f=>{p(a.windExposure(f),w),p(a.solarGain(f),w),p(a.thermalLeadH(f),w),p(a.forecastOffset(f),y)}),v(),y(),w()}});var Pr=`
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
`;S("app-root",Pr);var Rr=e=>`
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
          <div class="settings-asgard-slot"></div>
          <div class="settings-forecast-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;z({tag:"app-root",render:Rr,onMount(e,t){t.querySelector(".hdr").appendChild(O("hv6-header")),t.querySelector(".overview-flow").appendChild(O("flow-diagram")),t.querySelector(".overview-timeline").appendChild(O("zone-state-timeline")),t.querySelector(".overview-connectivity").appendChild(O("connectivity-card")),t.querySelector(".overview-flow-return").appendChild(O("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(O("graph-widgets",{variant:"demand"})),t.querySelector(".zone-selector").appendChild(O("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(O("zone-detail",{zone:C("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(O("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(O("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(O("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(O("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(O("settings-motor-calibration-card")),t.querySelector(".settings-helios-slot").appendChild(O("settings-helios-card")),t.querySelector(".settings-asgard-slot").appendChild(O("settings-asgard-card")),t.querySelector(".settings-forecast-slot").appendChild(O("settings-forecast-card")),t.querySelector(".diag-manual-badge-slot").appendChild(O("diag-manual-badge"));let r=t.querySelector(".diag-layout");r.appendChild(O("diag-i2c")),r.appendChild(O("diag-activity")),r.appendChild(O("diag-zone"));let o=C("selectedZone")||1;r.appendChild(O("diag-zone-motor-card",{zone:o})),r.appendChild(O("diag-zone-recovery-card",{zone:o}));let s=t.querySelectorAll(".sec");function n(){let i=C("section");s.forEach(d=>{d.classList.toggle("active",d.getAttribute("data-section")===i)})}M("section",n),n()}});function Hr(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(O("app-root")),Xe()}Hr();})();

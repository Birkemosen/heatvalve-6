(()=>{var ot={},Ae={};function _(e){return ot[e.tag]=e,e}function O(e,t){let o=ot[e];if(!o)throw new Error("Component not found: "+e);let r=t||{};if(o.state){let i=o.state(t||{});for(let c in i)r[c]=i[c]}if(o.methods)for(let i in o.methods)r[i]=o.methods[i];let s=document.createElement("div");s.innerHTML=o.render(r);let a=s.firstElementChild;return o.onMount&&o.onMount(r,a),a}function g(e,t){(Ae[e]||(Ae[e]=[])).push(t)}function G(e){let t=Ae[e];if(t)for(let o=0;o<t.length;o++)t[o](e)}var K=6,$t=28,Le=Object.create(null),jt=Gt(),D={section:"overview",selectedZone:1,live:!1,pendingWrites:0,lastWriteAt:0,firmwareVersion:"",i2cResult:"No scan has been run yet.",activityLog:[],zoneLog:Vt(),historyFlow:[],historyReturn:[],historyDemand:[],lastHistoryAt:0,zoneNames:jt,manualMode:!1,zoneStateHistory:null};function Vt(){let e=Object.create(null);for(let t=1;t<=K;t++)e[t]=[];return e}function Gt(){let e=[];try{e=JSON.parse(localStorage.getItem("hv6_zone_names")||"[]")}catch(t){e=[]}for(;e.length<K;)e.push("");return e.slice(0,K)}function Ut(){try{localStorage.setItem("hv6_zone_names",JSON.stringify(D.zoneNames))}catch(e){}}function X(e){return"$dashboard:"+e}function Fe(e){return Math.max(1,Math.min(K,Number(e)||1))}function at(e){if(e==null)return null;if(typeof e=="number")return Number.isFinite(e)?e:null;if(typeof e=="string"){let t=Number(e);if(!Number.isNaN(t))return t;let o=e.match(/-?\d+(?:[\.,]\d+)?/);if(o){let r=Number(String(o[0]).replace(",","."));return Number.isNaN(r)?null:r}}return null}function h(e){let t=Le[e];return t?t.v!=null?t.v:t.value!=null?t.value:at(t.s!=null?t.s:t.state):null}function z(e){let t=Le[e];return t?t.s!=null?t.s:t.state!=null?t.state:t.v===!0?"ON":t.v===!1?"OFF":t.value===!0?"ON":t.value===!1?"OFF":"":""}function Xt(e){return e===!0?!0:e===!1?!1:String(e||"").toLowerCase()==="on"}function H(e){return Xt(z(e))}function u(e,t){let o=Le[e];o||(o=Le[e]={v:null,s:null}),"v"in t&&(o.v=t.v,o.value=t.v),"value"in t&&(o.v=t.value,o.value=t.value),"s"in t&&(o.s=t.s,o.state=t.s),"state"in t&&(o.s=t.state,o.state=t.state);for(let r in t)r==="v"||r==="value"||r==="s"||r==="state"||(o[r]=t[r]);G(e),e==="text_sensor-firmware_version"&&le("firmwareVersion",z(e)||"")}function F(e,t){g(X(e),t)}function E(e){return D[e]}function le(e,t){D[e]=t,G(X(e))}function nt(e){D.section!==e&&(D.section=e,G(X("section")))}function st(e){let t=Fe(e);D.selectedZone!==t&&(D.selectedZone=t,G(X("selectedZone")))}function de(e){let t=!!e;D.live!==t&&(D.live=t,G(X("live")))}function it(){D.pendingWrites+=1,G(X("pendingWrites"))}function $e(){D.pendingWrites=Math.max(0,D.pendingWrites-1),D.lastWriteAt=Date.now(),G(X("pendingWrites"))}function lt(){return D.pendingWrites>0?!0:Date.now()-D.lastWriteAt<2e3}function dt(e,t){let o=Fe(e)-1;D.zoneNames[o]=String(t||"").trim(),Ut(),G(X("zoneNames"))}function oe(e){return D.zoneNames[Fe(e)-1]||""}function ce(e){let t=Fe(e),o=oe(t);return o?"Zone "+t+" \xB7 "+o:"Zone "+t}function pe(e){D.i2cResult=e||"No scan has been run yet.",G(X("i2cResult"))}function C(e,t){let o={time:Yt(),msg:String(e||"")};for(D.activityLog.push(o);D.activityLog.length>60;)D.activityLog.shift();if(t>=1&&t<=K){let r=D.zoneLog[t];for(r.push(o);r.length>8;)r.shift();G(X("zoneLog:"+t))}G(X("activityLog"))}function ct(e){return e>=1&&e<=K?D.zoneLog[e]:D.activityLog}function We(e,t){let o=D[e];if(!Array.isArray(o))return;let r=at(t);if(r!=null){for(o.push(r);o.length>$t;)o.shift();G(X(e))}}function xe(e){let t=Date.now();if(!e&&t-D.lastHistoryAt<3200)return;D.lastHistoryAt=t;let o=0,r=0;for(let s=1;s<=K;s++){let a=h("sensor-zone_"+s+"_valve_pct");a!=null&&(o+=a,r+=1)}We("historyFlow",h("sensor-manifold_flow_temperature")),We("historyReturn",h("sensor-manifold_return_temperature")),We("historyDemand",r?o/r:0)}function Yt(){let e=new Date;return String(e.getHours()).padStart(2,"0")+":"+String(e.getMinutes()).padStart(2,"0")+":"+String(e.getSeconds()).padStart(2,"0")}function Me(e){D.zoneStateHistory=e||null,G(X("zoneStateHistory"))}var l={temp:e=>"sensor-zone_"+e+"_temperature",setpoint:e=>"number-zone_"+e+"_setpoint",climate:e=>"climate-zone_"+e,valve:e=>"sensor-zone_"+e+"_valve_pct",state:e=>"text_sensor-zone_"+e+"_state",enabled:e=>"switch-zone_"+e+"_enabled",probe:e=>"select-zone_"+e+"_probe",tempSource:e=>"select-zone_"+e+"_temp_source",syncTo:e=>"select-zone_"+e+"_sync_to",pipeType:e=>"select-zone_"+e+"_pipe_type",area:e=>"number-zone_"+e+"_area_m2",spacing:e=>"number-zone_"+e+"_pipe_spacing_mm",ble:e=>"text-zone_"+e+"_ble_mac",exteriorWalls:e=>"text-zone_"+e+"_exterior_walls",motorTarget:e=>"number-motor_"+e+"_target_position",motorOpenRipples:e=>"sensor-motor_"+e+"_learned_open_ripples",motorCloseRipples:e=>"sensor-motor_"+e+"_learned_close_ripples",motorOpenFactor:e=>"sensor-motor_"+e+"_learned_open_factor",motorCloseFactor:e=>"sensor-motor_"+e+"_learned_close_factor",preheatAdvance:e=>"sensor-zone_"+e+"_preheat_advance_c",motorLastFault:e=>"text_sensor-motor_"+e+"_last_fault",probeTemp:e=>"sensor-probe_"+e+"_temperature",windExposure:e=>"number-zone_"+e+"_wind_exposure",solarGain:e=>"number-zone_"+e+"_solar_gain",thermalLeadH:e=>"number-zone_"+e+"_thermal_lead_h",forecastOffset:e=>"sensor-zone_"+e+"_forecast_offset_c",forecastPeakH:e=>"sensor-zone_"+e+"_forecast_peak_h"},n={deviceVariant:"text-device_variant",flow:"sensor-manifold_flow_temperature",ret:"sensor-manifold_return_temperature",uptime:"sensor-uptime",wifi:"sensor-wifi_signal",drivers:"switch-motor_drivers_enabled",fault:"binary_sensor-motor_fault",ip:"text_sensor-ip_address",ssid:"text_sensor-connected_ssid",mac:"text_sensor-mac_address",firmware:"text_sensor-firmware_version",manifoldFlowProbe:"select-manifold_flow_probe",manifoldReturnProbe:"select-manifold_return_probe",manifoldType:"select-manifold_type",motorProfileDefault:"select-motor_profile_default",closeThresholdMultiplier:"number-close_threshold_multiplier",closeSlopeThreshold:"number-close_slope_threshold",closeSlopeCurrentFactor:"number-close_slope_current_factor",openThresholdMultiplier:"number-open_threshold_multiplier",openSlopeThreshold:"number-open_slope_threshold",openSlopeCurrentFactor:"number-open_slope_current_factor",openRippleLimitFactor:"number-open_ripple_limit_factor",genericRuntimeLimitSeconds:"number-generic_runtime_limit_seconds",hmipRuntimeLimitSeconds:"number-hmip_runtime_limit_seconds",relearnAfterMovements:"number-relearn_after_movements",relearnAfterHours:"number-relearn_after_hours",learnedFactorMinSamples:"number-learned_factor_min_samples",learnedFactorMaxDeviationPct:"number-learned_factor_max_deviation_pct",simplePreheatEnabled:"switch-simple_preheat_enabled",preheatAbsorbEnabled:"switch-preheat_absorb_enabled",preheatAbsorbBandC:"number-preheat_absorb_band_c",preheatDetectDeltaC:"number-preheat_detect_delta_c",preheatAbsorbing:"text-preheat_absorbing",asgardEnabled:"switch-asgard_enabled",asgardCoordinator:"switch-asgard_coordinator",asgardHost:"text-asgard_host",asgardPort:"number-asgard_port",asgardEntityName:"text-asgard_entity_name",asgardPeerHost:"text-asgard_peer_host",asgardPushIntervalS:"number-asgard_push_interval_s",asgardRole:"text-asgard_role",asgardPeerStatus:"text-asgard_peer_status",asgardLastError:"text-asgard_last_error",asgardLastPushC:"sensor-asgard_last_push_c",asgardSetpointC:"sensor-asgard_setpoint_c",asgardLastPushAgeS:"sensor-asgard_last_push_age_s",asgardLocalZones:"sensor-asgard_local_zones",asgardPeerZones:"sensor-asgard_peer_zones",forecastEnabled:"switch-forecast_enabled",forecastStatus:"text-forecast_status",forecastLastError:"text-forecast_last_error",forecastAgeS:"sensor-forecast_age_s",forecastFailStreak:"sensor-forecast_fail_streak",forecastLatitude:"number-forecast_latitude",forecastLongitude:"number-forecast_longitude",forecastLoadThreshold:"number-forecast_load_threshold",forecastMaxOffsetC:"number-forecast_max_offset_c"};var B=6,Jt=8,pt=null,ve=0,k={temp:new Float32Array(B),setpoint:new Float32Array(B),valve:new Float32Array(B),enabled:new Uint8Array(B),driversEnabled:1,fault:0,manualMode:0};function Qt(){k.manualMode=0,le("manualMode",!1);for(let a=0;a<B;a++){k.temp[a]=20.5+a*.4,k.setpoint[a]=21+a%3*.5,k.valve[a]=12+a*8,k.enabled[a]=a===4?0:1;let i=a+1;u(l.temp(i),{value:k.temp[a]}),u(l.setpoint(i),{value:k.setpoint[a]}),u(l.valve(i),{value:k.valve[a]}),u(l.state(i),{state:k.valve[a]>5?"heating":"idle"}),u(l.enabled(i),{value:!!k.enabled[a],state:k.enabled[a]?"on":"off"}),u(l.probe(i),{state:"Probe "+i}),u(l.tempSource(i),{state:i%2?"Local Probe":"BLE"}),u(l.syncTo(i),{state:"None"}),u(l.pipeType(i),{state:"PEX 16mm"}),u(l.area(i),{value:8+i*3.5}),u(l.spacing(i),{value:[150,200,150,100,200,150][a]}),u(l.ble(i),{state:"AA:BB:CC:DD:EE:0"+i}),u(l.exteriorWalls(i),{state:["N","E","S","W","N,E","S,W"][a]}),u(l.preheatAdvance(i),{value:.08+a*.03})}for(let a=1;a<=Jt;a++){let i=a<=B?a:B,c=k.temp[i-1]+(a>B?1:.1*a);u(l.probeTemp(a),{value:c})}u(n.flow,{value:34.1}),u(n.ret,{value:30.4}),u(n.uptime,{value:18*3600+720}),u(n.wifi,{value:-57}),u(n.drivers,{value:!0,state:"on"}),u(n.fault,{value:!1,state:"off"}),u(n.ip,{state:"192.168.1.86"}),u(n.ssid,{state:"MockLab"}),u(n.mac,{state:"D8:3B:DA:12:34:56"}),u(n.firmware,{state:"0.5.x-mock"}),u(n.manifoldFlowProbe,{state:"Probe 7"}),u(n.manifoldReturnProbe,{state:"Probe 8"}),u(n.manifoldType,{state:"NC (Normally Closed)"}),u(n.motorProfileDefault,{state:"HmIP VdMot"}),u(n.closeThresholdMultiplier,{value:1.7}),u(n.closeSlopeThreshold,{value:1}),u(n.closeSlopeCurrentFactor,{value:1.4}),u(n.openThresholdMultiplier,{value:1.7}),u(n.openSlopeThreshold,{value:.8}),u(n.openSlopeCurrentFactor,{value:1.3}),u(n.openRippleLimitFactor,{value:1}),u(n.genericRuntimeLimitSeconds,{value:45}),u(n.hmipRuntimeLimitSeconds,{value:40}),u(n.relearnAfterMovements,{value:2e3}),u(n.relearnAfterHours,{value:168}),u(n.learnedFactorMinSamples,{value:3}),u(n.learnedFactorMaxDeviationPct,{value:12}),u(n.simplePreheatEnabled,{state:"on"}),xe(!0);let e=300,t=Number(Date.now()/1e3)|0,o=288,r=[[5,5,5,6,5,5,5,5,6,6,5,5,5,5,5,6,5,5,5,5,5,6,6,5],[6,6,5,5,6,6,6,5,5,6,6,6,5,5,6,6,6,6,5,5,6,6,5,5],[5,5,5,5,5,5,6,6,6,6,6,6,5,5,5,5,6,6,6,6,5,5,5,5],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[5,6,5,5,5,6,6,5,5,6,5,5,5,6,5,5,6,6,5,5,5,5,6,6]],s=[];for(let a=0;a<o;a++){let i=(o-1-a)*e,c=t-i,p=Math.floor(a/12)%24,m=r.map(b=>b[p%b.length]);s.push([c,...m])}Me({interval_s:e,uptime_s:t,count:o,entries:s})}function Kt(){ve+=1,u(n.uptime,{value:Number(Date.now()/1e3)|0}),u(n.wifi,{value:-55-Math.round((1+Math.sin(ve/4))*6)});let e=0,t=0,o=0;for(let i=0;i<B;i++){let c=i+1,p=!!k.enabled[i],m=k.temp[i],b=k.setpoint[i],v=p&&k.driversEnabled&&!k.manualMode&&m<b-.25;k.manualMode?k.valve[i]=Math.max(0,k.valve[i]):!p||!k.driversEnabled?k.valve[i]=Math.max(0,k.valve[i]-6):v?k.valve[i]=Math.min(100,k.valve[i]+7+c%3):k.valve[i]=Math.max(0,k.valve[i]-5);let w=v?.05+k.valve[i]/2200:-.03+k.valve[i]/3200;k.temp[i]=m+w+Math.sin((ve+c)/5)*.04,p&&k.valve[i]>0&&(e+=k.valve[i],t+=1,o=Math.max(o,k.valve[i])),u(l.temp(c),{value:k.temp[i]}),u(l.valve(c),{value:Math.round(k.valve[i])});let d=Math.max(0,(k.setpoint[i]-k.temp[i]-.15)*.22);u(l.preheatAdvance(c),{value:Number(d.toFixed(2))}),u(l.state(c),{state:p?v?"heating":"idle":"off"}),u(l.enabled(c),{value:p,state:p?"on":"off"}),u(l.probeTemp(c),{value:k.temp[i]+Math.sin((ve+c)/6)*.1})}let r=29.5+o*.075+t*.18+Math.sin(ve/6)*.25,s=r-(t?2.1+e/Math.max(1,t*50):1.1);u(n.flow,{value:Number(r.toFixed(1))}),u(n.ret,{value:Number(s.toFixed(1))}),u(l.probeTemp(7),{value:Number((s-.4).toFixed(1))}),u(l.probeTemp(8),{value:Number((r+.2).toFixed(1))}),xe(!0);let a=E("zoneStateHistory");a&&(a.uptime_s=Number(Date.now()/1e3)|0)}function gt(){pt||(Qt(),de(!0),pt=setInterval(Kt,1200))}function Ne(e){let t=e.key||"",o=e.value,r=e.zone||0;if(t==="zone_setpoint"&&r>=1&&r<=B){let a=Number(o);Number.isNaN(a)||(k.setpoint[r-1]=a,u(l.setpoint(r),{value:a}),C("Zone "+r+" setpoint set to "+a.toFixed(1)+"\xB0C",r));return}if(t==="zone_enabled"&&r>=1&&r<=B){let a=o>.5;k.enabled[r-1]=a?1:0,u(l.enabled(r),{value:a,state:a?"on":"off"}),C("Zone "+r+(a?" enabled":" disabled"),r);return}if(t==="drivers_enabled"){let a=o>.5;k.driversEnabled=a?1:0,u(n.drivers,{value:a,state:a?"on":"off"}),C(a?"Motor drivers enabled":"Motor drivers disabled");return}if(t==="manual_mode"){let a=o>.5;k.manualMode=a?1:0,le("manualMode",a);return}if(t==="motor_target"&&r>=1&&r<=B){let a=Number(o||0);u(l.motorTarget(r),{value:Math.max(0,Math.min(100,Math.round(a)))}),C("Motor "+r+" target set to "+a+"%",r);return}if(t==="command"){let a=String(o);if(a==="i2c_scan"){pe(`I2C_SCAN: ----- begin -----
I2C_SCAN: found 0x3C
I2C_SCAN: found 0x44
I2C_SCAN: found 0x76
I2C_SCAN: ----- end -----`),C("I2C scan complete");return}if(a==="calibrate_all_motors"||a==="restart"){C("Command executed: "+a);return}if(a==="open_motor_timed"&&r>=1&&r<=B){C("Motor "+r+" open timed",r);return}if(a==="close_motor_timed"&&r>=1&&r<=B){C("Motor "+r+" close timed",r);return}if(a==="stop_motor"&&r>=1&&r<=B){C("Motor "+r+" stopped",r);return}if(a==="motor_reset_fault"&&r>=1&&r<=B){C("Motor "+r+" fault reset",r);return}if(a==="motor_reset_learned_factors"&&r>=1&&r<=B){C("Motor "+r+" learned factors reset",r);return}if(a==="motor_reset_and_relearn"&&r>=1&&r<=B){C("Motor "+r+" reset and relearn started",r);return}return}if(t==="zone_probe"&&r>=1){u(l.probe(r),{state:String(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_temp_source"&&r>=1){u(l.tempSource(r),{state:String(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_sync_to"&&r>=1){u(l.syncTo(r),{state:String(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_type"&&r>=1){u(l.pipeType(r),{state:String(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="manifold_type"){u(n.manifoldType,{state:String(o)}),C("Setting updated: "+t+" = "+o);return}if(t==="manifold_flow_probe"){u(n.manifoldFlowProbe,{state:String(o)}),C("Setting updated: "+t+" = "+o);return}if(t==="manifold_return_probe"){u(n.manifoldReturnProbe,{state:String(o)}),C("Setting updated: "+t+" = "+o);return}if(t==="motor_profile_default"){u(n.motorProfileDefault,{state:String(o)}),C("Setting updated: "+t+" = "+o);return}if(t==="simple_preheat_enabled"){u(n.simplePreheatEnabled,{state:String(o)}),C("Setting updated: "+t+" = "+o);return}if(t==="zone_ble_mac"&&r>=1){u(l.ble(r),{state:String(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_exterior_walls"&&r>=1){u(l.exteriorWalls(r),{state:String(o)||"None"}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_area_m2"&&r>=1){u(l.area(r),{value:Number(o)}),C("Setting updated: "+t+" = "+o,r);return}if(t==="zone_pipe_spacing_mm"&&r>=1){u(l.spacing(r),{value:Number(o)}),C("Setting updated: "+t+" = "+o,r);return}let s={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct};if(s[t]){let a=Number(o);Number.isNaN(a)||(u(s[t],{value:a}),C("Setting updated: "+t+" = "+o));return}}window.__hv6_mock={setSetpoint(e,t){Ne({key:"zone_setpoint",value:t,zone:e})},toggleZone(e){let t=!k.enabled[e-1];Ne({key:"zone_enabled",value:t?1:0,zone:e})}};var ut="/api/hv6/v1";function mt(){return!!(window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock)}function V(e,t,o){if(it(),mt())try{return Ne(o),Promise.resolve({ok:!0})}finally{$e()}let r=new URLSearchParams;for(let[i,c]of Object.entries(t||{}))c!=null&&r.append(i,c);let s=r.toString(),a=ut+e+(s?"?"+s:"");return fetch(a,{method:"POST"}).then(i=>(i.ok||console.warn(`API call failed: POST ${e} status=${i.status}`),i)).catch(i=>{throw console.error(`API call error: POST ${e}:`,i),i}).finally(()=>{$e()})}function je(e,t){return u(l.setpoint(e),{value:t}),V(`/zones/${e}/setpoint`,{setpoint_c:t},{key:"zone_setpoint",value:t,zone:e})}function bt(e,t){return u(l.enabled(e),{state:t?"on":"off",value:t}),V(`/zones/${e}/enabled`,{enabled:!!t},{key:"zone_enabled",value:t?1:0,zone:e})}function Te(e){return u(n.drivers,{state:e?"on":"off",value:e}),V("/drivers/enabled",{enabled:!!e},{key:"drivers_enabled",value:e?1:0})}function ae(e,t){return V("/commands",{command:e,zone:t||void 0},{key:"command",value:e,zone:t||void 0})}function ft(){return pe("Scanning I2C bus..."),C("I2C scan started"),ae("i2c_scan")}var er={zone_probe:e=>l.probe(e),zone_temp_source:e=>l.tempSource(e),zone_sync_to:e=>l.syncTo(e),zone_pipe_type:e=>l.pipeType(e)},tr={zone_ble_mac:e=>l.ble(e),zone_exterior_walls:e=>l.exteriorWalls(e)},rr={zone_area_m2:e=>l.area(e),zone_pipe_spacing_mm:e=>l.spacing(e)},or={manifold_type:n.manifoldType,manifold_flow_probe:n.manifoldFlowProbe,manifold_return_probe:n.manifoldReturnProbe,motor_profile_default:n.motorProfileDefault,simple_preheat_enabled:n.simplePreheatEnabled},ar={close_threshold_multiplier:n.closeThresholdMultiplier,close_slope_threshold:n.closeSlopeThreshold,close_slope_current_factor:n.closeSlopeCurrentFactor,open_threshold_multiplier:n.openThresholdMultiplier,open_slope_threshold:n.openSlopeThreshold,open_slope_current_factor:n.openSlopeCurrentFactor,open_ripple_limit_factor:n.openRippleLimitFactor,generic_runtime_limit_seconds:n.genericRuntimeLimitSeconds,hmip_runtime_limit_seconds:n.hmipRuntimeLimitSeconds,relearn_after_movements:n.relearnAfterMovements,relearn_after_hours:n.relearnAfterHours,learned_factor_min_samples:n.learnedFactorMinSamples,learned_factor_max_deviation_pct:n.learnedFactorMaxDeviationPct};function ge(e,t,o){let r=er[t];return r&&u(r(e),{state:o}),V("/settings/select",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function he(e,t,o){let r=tr[t];return r&&u(r(e),{state:o}),V("/settings/text",{key:t,value:o,zone:e},{key:t,value:o,zone:e})}function ye(e,t,o){let r=Number(o),s=rr[t];return s&&!Number.isNaN(r)&&u(s(e),{value:r}),V("/settings/number",{key:t,value:r,zone:e},{key:t,value:r,zone:e})}function Y(e,t){let o=or[e];return o&&u(o,{state:t}),V("/settings/select",{key:e,value:t},{key:e,value:t})}function J(e,t){let o=Number(t),r=ar[e];return r&&!Number.isNaN(o)&&u(r,{value:o}),V("/settings/number",{key:e,value:o},{key:e,value:o})}function xt(e,t){return V("/settings/text",{key:e,value:t},{key:e,value:t})}function vt(e,t){let o=Number(t),r=Number.isNaN(o)?0:Math.max(0,Math.min(100,Math.round(o)));return u(l.motorTarget(e),{value:r}),C("Motor "+e+" target set to "+r+"%",e),V(`/motors/${e}/target`,{value:r},{key:"motor_target",value:r,zone:e})}function ht(e,t=1e4){return C("Motor "+e+" open for "+t+"ms",e),V(`/motors/${e}/open_timed`,{},{key:"command",value:"open_motor_timed",zone:e})}function yt(e,t=1e4){return C("Motor "+e+" close for "+t+"ms",e),V(`/motors/${e}/close_timed`,{},{key:"command",value:"close_motor_timed",zone:e})}function Ve(e){return C("Motor "+e+" stopped",e),V(`/motors/${e}/stop`,{},{key:"command",value:"stop_motor",zone:e})}function Ge(e){return le("manualMode",!!e),C(e?"Manual mode enabled \u2014 automatic management paused":"Manual mode disabled \u2014 automatic management resumed"),V("/manual_mode",{enabled:!!e},{key:"manual_mode",value:e?1:0})}function wt(e){return C("Motor "+e+" fault reset",e),ae("motor_reset_fault",e)}function zt(e){return C("Motor "+e+" learned factors reset",e),ae("motor_reset_learned_factors",e)}function _t(e){return C("Motor "+e+" reset and relearn started",e),ae("motor_reset_and_relearn",e)}function Ue(){mt()||fetch(ut+"/history",{cache:"no-store"}).then(e=>e.ok?e.json():null).then(e=>{e&&Me(e)}).catch(()=>{})}var Xe=null,De=null,St=null;async function nr(){De&&De.abort(),De=new AbortController;let e=await fetch("/api/hv6/v1/state",{cache:"no-store",signal:De.signal});if(e.status===503)throw new Error("State fetch busy");if(!e.ok)throw new Error("State fetch failed: "+e.status);return e.json()}function kt(e){if(!(!e||typeof e!="object")&&!lt()){for(let t in e)u(t,e[t]);xe(!1)}}function sr(e){if(e){if(!e.type){kt(e);return}if(e.type==="state"){kt(e.data);return}if(e.type==="log"){let t=e.data&&(e.data.message||e.data.msg||e.data.text||"");if(!t)return;C(t),String(t).indexOf("I2C_SCAN:")!==-1&&pe(String(t))}}}function Et(){Xe||(Xe=setTimeout(()=>{Xe=null,Ye()},1e3))}function Ye(){let e=window.HV6_DASHBOARD_CONFIG;if(e&&e.mock){gt();return}nr().then(t=>{de(!0),sr(t),Ue(),St||(St=setInterval(Ue,300*1e3)),Et()}).catch(()=>{de(!1),Et()})}var Ct=Object.create(null);function S(e,t){if(Ct[e])return;Ct[e]=1;let o=document.createElement("style");o.textContent=t,document.head.appendChild(o)}function W(e){return e!=null&&!isNaN(e)?Math.round(e*10)/10+"\xB0C":"---"}function ue(e){return e!=null&&!isNaN(e)?(e|0)+"%":"---"}function Oe(e){if(!e||isNaN(e))return"---";e=e|0;var t=e/86400|0,o=e%86400/3600|0,r=e%3600/60|0;return t>0?t+"d "+o+"h "+r+"m":o>0?o+"h "+r+"m":r+"m"}function At(e){return e==null||isNaN(e)?"---":(e=e|0,e>-50?e+" dBm \u2590\u2590\u2590\u2590":e>-60?e+" dBm \u2590\u2590\u2590\u2591":e>-70?e+" dBm \u2590\u2590\u2591\u2591":e>-80?e+" dBm \u2590\u2591\u2591\u2591":e+" dBm \u2591\u2591\u2591\u2591")}var ir=`
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
`;S("hv6-header",ir);var lr=()=>`
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
        <a href="#" class="menu-link" data-section="smart-heating">Smart Heating</a>
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
`,ca=_({tag:"hv6-header",render:lr,onMount(e,t){let o=t.querySelector("#hdr-mode"),r=t.querySelector("#hdr-dot"),s=t.querySelector("#hdr-sync"),a=t.querySelector("#hdr-up"),i=t.querySelector("#hdr-wifi"),c=t.querySelector("#hdr-fw"),p=t.querySelectorAll(".menu-link");function m(){let v=E("section");p.forEach(w=>{w.classList.toggle("active",w.getAttribute("data-section")===v)})}function b(){let v=E("live"),w=E("pendingWrites"),d=window.HV6_DASHBOARD_CONFIG&&window.HV6_DASHBOARD_CONFIG.mock?window.HV6_DASHBOARD_CONFIG.mockLabel||"Mock":v?"Live":"Offline";o.textContent=d,r.classList.toggle("on",!!v),s.textContent=w>0?"Saving...":v?"Synced":"Offline";let f=w>0?"saving":v?"synced":"offline";s.className="meta-chip meta-chip-state "+f,a.textContent=Oe(h(n.uptime)),i.textContent=At(h(n.wifi));let x=E("firmwareVersion")||z(n.firmware);c.textContent=x?"FW "+x:""}p.forEach(v=>{v.addEventListener("click",w=>{w.preventDefault(),nt(v.getAttribute("data-section"))})}),F("section",m),F("live",b),F("pendingWrites",b),F("firmwareVersion",b),g(n.uptime,b),g(n.wifi,b),g(n.firmware,b),m(),b()}});var dr=`
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
`;S("status-card",dr);var cr=e=>`
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
`,xa=_({tag:"status-card",state:()=>({motorDrivers:"---",motorDriversOn:!1,motorFault:"---",connOn:!1}),render:cr,methods:{update(e){this.motorDriversOn=H(n.drivers),this.motorDrivers=this.motorDriversOn?"ON":"OFF",this.motorFault=H(n.fault)?"FAULT":"OK",this.connOn=E("live")===!0,e.drv.textContent=this.motorDrivers,e.drv.style.color=this.motorDriversOn?"var(--blue)":"var(--state-danger)";let t=this.motorFault==="FAULT";e.fault.textContent=this.motorFault,e.fault.style.color=t?"var(--state-danger)":"var(--state-ok)",e.dot.classList.toggle("on",this.connOn),e.sw.className="sw "+(this.motorDriversOn?"on":"off")}},onMount(e,t){let o={drv:t.querySelector("#sys-drv"),fault:t.querySelector("#sys-fault"),dot:t.querySelector("#sys-dot"),sw:t.querySelector("#sw-drv")},r=()=>e.update(o);g(n.drivers,r),g(n.fault,r),F("live",r),o.sw.onclick=()=>{Te(!e.motorDriversOn)},r()}});var pr=`
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
`;S("connectivity-card",pr);var gr=()=>`
  <div class="connectivity-card">
    <div class="card-title">Connectivity</div>
    <table class="st">
      <tr><td>IP Address</td><td class="cc-ip">---</td></tr>
      <tr><td>SSID</td><td class="cc-ssid">---</td></tr>
      <tr><td>MAC Address</td><td class="cc-mac">---</td></tr>
      <tr><td>Uptime</td><td class="cc-up">---</td></tr>
    </table>
  </div>
`,Sa=_({tag:"connectivity-card",render:gr,onMount(e,t){let o=t.querySelector(".cc-ip"),r=t.querySelector(".cc-ssid"),s=t.querySelector(".cc-mac"),a=t.querySelector(".cc-up");function i(){o.textContent=z(n.ip)||"---",r.textContent=z(n.ssid)||"---",s.textContent=z(n.mac)||"---",a.textContent=Oe(h(n.uptime))}g(n.ip,i),g(n.ssid,i),g(n.mac,i),g(n.uptime,i),i()}});var Je="http://www.w3.org/2000/svg",Mt=220,Qe=132,ee=10,ur=10,mr=24,Q=34,we=Mt-Q-ur,se=Qe-ee-mr,br=360,fr=`
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
`;S("graph-widgets",fr);var xr=e=>e.variant==="flow-return"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div></div>':e.variant==="demand"?'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>':'<div class="graph-widgets"><div class="graph-card"><div class="graph-head"><span>Flow / Return</span><strong class="gw-dt">---</strong></div><div class="graph-legend"><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--accent)"></span>Flow</span><span class="graph-legend-item"><span class="graph-legend-dot" style="background:var(--blue)"></span>Return</span></div><svg class="gw-flow"></svg></div><div class="graph-card"><div class="graph-head"><span>Demand Index</span><strong class="gw-demand-text">---</strong></div><svg class="gw-demand"></svg></div></div>';function Lt(e,t,o){if(!e.length)return"";let r=Math.max(.001,o-t),s=e.length>1?we/(e.length-1):0,a="";for(let i=0;i<e.length;i++){let c=Q+s*i,p=ee+(1-(e[i]-t)/r)*se;a+=(i?" L ":"M ")+c.toFixed(2)+" "+p.toFixed(2)}return a}function me(e,t,o){let r=document.createElementNS(Je,e);return t&&Object.keys(t).forEach(s=>{r.setAttribute(s,t[s])}),o!=null&&(r.textContent=o),r}function vr(e,t){return Number.isFinite(e)?t==="%"?Math.round(e)+"%":e.toFixed(1)+"C":"---"}function hr(e){return e<=0?"now":e>=60?"-"+Math.round(e/60)+"h":"-"+Math.round(e)+"m"}function yr(e,t,o,r){let s="rgba(143, 176, 230, 0.42)",a="rgba(143, 176, 230, 0.16)",c=[{x:Q,ratio:0},{x:Q+we/2,ratio:.5},{x:Q+we,ratio:1}];e.appendChild(me("line",{x1:Q,y1:ee,x2:Q,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"})),e.appendChild(me("line",{x1:Q,y1:ee+se,x2:Q+we,y2:ee+se,stroke:s,"stroke-width":"1",class:"graph-axis"}));for(let p=0;p<3;p++){let m=p/2,b=ee+m*se,v=o-(o-t)*m;e.appendChild(me("line",{x1:Q,y1:b,x2:Q+we,y2:b,stroke:a,"stroke-width":"1",class:"graph-grid"})),e.appendChild(me("text",{x:Q-5,y:b+3,"text-anchor":"end",class:"graph-tick-label"},vr(v,r)))}c.forEach(p=>{let m=br*(1-p.ratio);e.appendChild(me("text",{x:p.x,y:Qe-6,"text-anchor":p.ratio===0?"start":p.ratio===1?"end":"middle",class:"graph-tick-label"},hr(m)))}),e.appendChild(me("text",{x:5,y:ee+se/2,transform:"rotate(-90 5 "+(ee+se/2).toFixed(2)+")","text-anchor":"middle",class:"graph-axis-label"},r==="%"?"Demand":"Temp"))}function wr(e,t,o){let r=e.concat(t||[]).filter(c=>Number.isFinite(c));if(!r.length)return o==="%"?{min:0,max:100}:{min:0,max:10};let s=Math.min.apply(null,r),a=Math.max.apply(null,r);if(o==="%"&&(s=Math.max(0,s),a=Math.min(100,a)),s===a){let c=o==="%"?5:.5;s-=c,a+=c}let i=(a-s)*.08;return s-=i,a+=i,o==="%"&&(s=Math.max(0,s),a=Math.min(100,a)),{min:s,max:a}}function Ft(e,t,o,r,s,a){e.innerHTML="",e.setAttribute("viewBox","0 0 "+Mt+" "+Qe),e.setAttribute("preserveAspectRatio","none");let i=wr(t,r,a);yr(e,i.min,i.max,a);let c=Lt(t,i.min,i.max);if(c){let m=document.createElementNS(Je,"path");m.setAttribute("d",c),m.setAttribute("fill","none"),m.setAttribute("stroke",o),m.setAttribute("stroke-width","2.2"),m.setAttribute("stroke-linecap","round"),m.setAttribute("stroke-linejoin","round"),e.appendChild(m)}let p=r&&r.length?Lt(r,i.min,i.max):"";if(p){let m=document.createElementNS(Je,"path");m.setAttribute("d",p),m.setAttribute("fill","none"),m.setAttribute("stroke",s),m.setAttribute("stroke-width","2"),m.setAttribute("stroke-linecap","round"),m.setAttribute("stroke-linejoin","round"),e.appendChild(m)}}var zr="var(--accent)",_r="var(--blue)",Sr="var(--blue)",La=_({tag:"graph-widgets",state:e=>({variant:e&&e.variant||"both"}),render:xr,onMount(e,t){let o=t.querySelector(".gw-dt"),r=t.querySelector(".gw-demand-text"),s=t.querySelector(".gw-flow"),a=t.querySelector(".gw-demand");function i(){let c=E("historyFlow"),p=E("historyReturn"),m=E("historyDemand"),b=c.length?c[c.length-1]:null,v=p.length?p[p.length-1]:null,w=m.length?m[m.length-1]:null;o&&s&&(o.textContent=b!=null&&v!=null?(b-v).toFixed(1)+" C":"---",Ft(s,c,zr,p,_r,"C")),r&&a&&(r.textContent=w!=null?Math.round(w)+"%":"---",Ft(a,m,Sr,null,null,"%"))}F("historyFlow",i),F("historyReturn",i),F("historyDemand",i),i()}});var ne={0:{label:"Off",color:"#2e3f5c"},1:{label:"Manual",color:"#4ecdc4"},2:{label:"Calibrating",color:"#f2c77b"},3:{label:"Wait Cal.",color:"#8ab0d4"},4:{label:"Wait Temp",color:"#8ab0d4"},5:{label:"Heating",color:"#EEA111"},6:{label:"Idle",color:"#53A8FF"},7:{label:"Overheated",color:"#ff6464"},255:{label:"",color:"transparent"}},Nt=24*3600,_e=18,Ke=4,ze=54,Pe=20,Se=4,qe=K*(_e+Ke)-Ke+Se+Pe,kr=`
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
`;S("zone-state-timeline",kr);var Er=()=>`
  <div class="timeline-card">
    <div class="timeline-head">
      <span>Zone State History</span>
      <strong>24 h</strong>
    </div>
    <div class="tl-body"></div>
    <div class="timeline-legend"></div>
  </div>
`;function Cr(e,t){if(!e||!e.entries||e.entries.length===0)return null;let o=e.entries,r=e.uptime_s||t||0,s=r-Nt,a=1e3,i=a-ze;function c(f){let x=(f-s)/Nt;return ze+Math.max(0,Math.min(1,x))*i}let p="http://www.w3.org/2000/svg",m=document.createElementNS(p,"svg");m.setAttribute("viewBox","0 0 "+a+" "+qe),m.classList.add("timeline-svg");let b=document.createElementNS(p,"rect");b.setAttribute("x",ze),b.setAttribute("y",Se),b.setAttribute("width",i),b.setAttribute("height",qe-Se-Pe),b.setAttribute("fill","rgba(10,24,46,0.55)"),b.setAttribute("rx","4"),m.appendChild(b);let v=[6,12,18,24];for(let f of v){let x=r-f*3600,A=c(x),y=document.createElementNS(p,"line");y.setAttribute("x1",A),y.setAttribute("y1",Se),y.setAttribute("x2",A),y.setAttribute("y2",qe-Pe),y.setAttribute("stroke","rgba(120,168,255,.12)"),y.setAttribute("stroke-width","1"),m.appendChild(y)}for(let f=0;f<K;f++){let x=Se+f*(_e+Ke),A=document.createElementNS(p,"rect");A.setAttribute("x",ze),A.setAttribute("y",x),A.setAttribute("width",i),A.setAttribute("height",_e),A.setAttribute("fill",f%2===0?"rgba(83,168,255,0.03)":"rgba(83,168,255,0.00)"),m.appendChild(A);let y=document.createElementNS(p,"text");y.setAttribute("x",ze-4),y.setAttribute("y",x+_e/2+1),y.setAttribute("text-anchor","end"),y.setAttribute("dominant-baseline","middle"),y.setAttribute("fill","rgba(191,211,245,.65)"),y.setAttribute("font-size","9.5"),y.setAttribute("font-family","Montserrat, sans-serif"),y.setAttribute("font-weight","600"),y.textContent="Z"+(f+1),m.appendChild(y);let R=o.filter(q=>q[0]>=s).map(q=>({t:q[0],state:q[f+1]}));if(R.length===0)continue;let Z=R[0].t,N=R[0].state,T=(q,L,M)=>{if(M===255)return;let P=ne[M]||ne[255];if(P.color==="transparent")return;let I=c(q),$=c(L),U=Math.max(1,$-I),j=document.createElementNS(p,"rect");j.setAttribute("x",I),j.setAttribute("y",x+1),j.setAttribute("width",U),j.setAttribute("height",_e-2),j.setAttribute("fill",P.color),j.setAttribute("rx","2"),j.setAttribute("opacity","0.88"),m.appendChild(j)};for(let q=1;q<R.length;q++){let L=R[q];L.state!==N&&(T(Z,L.t,N),Z=L.t,N=L.state)}T(Z,r,N)}let w=qe-Pe+14,d=[{label:"24h",hoursAgo:24},{label:"18h",hoursAgo:18},{label:"12h",hoursAgo:12},{label:"6h",hoursAgo:6},{label:"now",hoursAgo:0}];for(let f of d){let x=r-f.hoursAgo*3600,A=c(x),y=document.createElementNS(p,"text");y.setAttribute("x",A),y.setAttribute("y",w),y.setAttribute("text-anchor",f.hoursAgo===0?"end":"middle"),y.setAttribute("fill","rgba(191,211,245,.45)"),y.setAttribute("font-size","9"),y.setAttribute("font-family","Montserrat, sans-serif"),y.textContent=f.label,m.appendChild(y)}return m}function Ar(e){e.innerHTML="";let t=[{code:5,...ne[5]},{code:6,...ne[6]},{code:0,...ne[0]},{code:1,...ne[1]},{code:7,...ne[7]},{code:2,...ne[2]}];for(let o of t){let r=document.createElement("div");r.className="tl-legend-item",r.innerHTML='<span class="tl-legend-dot" style="background:'+o.color+'"></span>'+o.label,e.appendChild(r)}}var Oa=_({tag:"zone-state-timeline",render:Er,onMount(e,t){let o=t.querySelector(".tl-body"),r=t.querySelector(".timeline-legend");Ar(r);function s(){let a=E("zoneStateHistory"),i=(()=>{let p=E&&E("zoneStateHistory");return p&&p.uptime_s||Number(Date.now()/1e3)|0})();if(o.innerHTML="",!a||!a.entries||a.entries.length===0){let p=document.createElement("div");p.className="timeline-empty",p.textContent="No history yet \u2014 data accumulates every 5 minutes.",o.appendChild(p);return}let c=Cr(a,i);c&&o.appendChild(c)}F("zoneStateHistory",s),F("zoneNames",s),s()}});var Lr=`
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
`;S("zone-grid",Lr);var Fr=()=>'<div class="zone-grid"></div>',Ha=_({tag:"zone-grid",render:Fr,onMount(e,t){for(let o=1;o<=6;o++)t.appendChild(O("zone-card",{zone:o}))}});var Mr=`
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
`;S("zone-card",Mr);var Nr=e=>`
	<div class="zone-card" data-zone="${e.zone}">
		<div class="zc-state-row"><span class="zc-dot"></span><span class="zc-state-label">---</span></div>
		<div class="zc-zone-name">${ce(e.zone)}</div>
		<div class="zc-friendly">${oe(e.zone)||"---"}</div>
	</div>
`,Va=_({tag:"zone-card",state:e=>({zone:e.zone}),render:Nr,onMount(e,t){let o=e.zone,r=l.temp(o),s=l.state(o),a=l.enabled(o),i=t.querySelector(".zc-state-label"),c=t.querySelector(".zc-dot"),p=t.querySelector(".zc-zone-name"),m=t.querySelector(".zc-friendly");function b(){let v=H(a),w=String(z(s)||"").toUpperCase()||"OFF",d=E("selectedZone")===o,f=oe(o);p.textContent=ce(o),m.textContent=f||W(h(r)),i.textContent=v?w:"OFF";let x=v?w:"OFF",A=x==="HEATING"?"#f2c77b":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff7676":"#7D8BA7",y=x==="HEATING"?"#EEA111":x==="IDLE"?"#79d17e":x==="FAULT"?"#ff6464":"rgba(120,168,255,.35)";i.style.color=A,c.style.background=y,c.style.boxShadow=x==="HEATING"?"0 0 5px rgba(238,161,17,.6)":x==="FAULT"?"0 0 5px rgba(255,100,100,.6)":"",t.classList.toggle("active",d),t.classList.toggle("disabled",!v),t.classList.toggle("zs-heating",v&&w==="HEATING"),t.classList.toggle("zs-idle",v&&w!=="HEATING"),t.classList.toggle("zs-off",!v)}t.addEventListener("click",()=>{st(o)}),g(r,b),g(s,b),g(a,b),F("selectedZone",b),F("zoneNames",b),b()}});var Tr=`
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
`;S("zone-detail",Tr);var Dr=e=>`
  <div class="zone-detail" data-zone="${e.zone}">
    <div class="zd-head">
      <div class="zd-title">${ce(e.zone)}</div>
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
`,en=_({tag:"zone-detail",state:e=>({zone:e.zone,temp:"---",setpoint:"---",valve:"---",state:"---"}),render:Dr,methods:{update(e,t){let o=E("selectedZone"),r=String(z(l.state(o))||"").toUpperCase(),s=H(l.enabled(o));this.zone=o,e.dataset.zone=String(o),t.title.textContent=ce(o),t.setpoint.textContent=W(h(l.setpoint(o))),t.temp.textContent=W(h(l.temp(o))),t.ret.textContent=W(h("sensor-manifold_return_temperature")),t.valve.textContent=ue(h(l.valve(o)));let a=t.badge;a.textContent=s?r||"IDLE":"DISABLED";let i=s?r==="HEATING"?"badge-heating":r==="IDLE"?"badge-idle":r==="FAULT"?"badge-fault":"":"badge-disabled";a.className="zd-badge"+(i?" "+i:""),t.toggleRow.classList.toggle("is-on",s),t.toggle.classList.toggle("on",s)},incSetpoint(){let e=this.zone,t=h(l.setpoint(e))||20;je(e,Number((t+.5).toFixed(1)))},decSetpoint(){let e=this.zone,t=h(l.setpoint(e))||20;je(e,Number((t-.5).toFixed(1)))},toggleEnabled(){let e=this.zone,t=H(l.enabled(e));bt(e,!t)}},onMount(e,t){let o={title:t.querySelector(".zd-title"),setpoint:t.querySelector(".zd-setpoint"),temp:t.querySelector(".zd-temp"),ret:t.querySelector(".zd-ret"),valve:t.querySelector(".zd-valve"),badge:t.querySelector(".zd-badge"),toggleRow:t.querySelector(".zd-toggle-row"),toggle:t.querySelector(".btn-toggle"),inc:t.querySelector(".btn-inc"),dec:t.querySelector(".btn-dec")};o.inc.onclick=()=>e.incSetpoint(),o.dec.onclick=()=>e.decSetpoint(),o.toggle.onclick=()=>e.toggleEnabled();let r=()=>e.update(t,o),s=a=>{let i=E("selectedZone");(a===l.temp(i)||a===l.setpoint(i)||a===l.valve(i)||a===l.state(i)||a===l.enabled(i))&&r()};for(let a=1;a<=6;a++)g(l.temp(a),s),g(l.setpoint(a),s),g(l.valve(a),s),g(l.state(a),s),g(l.enabled(a),s);g("sensor-manifold_return_temperature",r),F("selectedZone",r),r()}});var Or=`
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
`;S("zone-sensor-card",Or);var qr=()=>{let e="<option>None</option>";for(let t=1;t<=8;t++)e+="<option>Probe "+t+"</option>";return`
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
  `};function Pr(e,t){let o=e.value,r="<option>None</option>";for(let s=1;s<=6;s++)s!==t&&(r+="<option>Zone "+s+"</option>");e.innerHTML=r,e.value=o||"None"}function Rr(e){return e==="BLE"||e==="BLE Sensor"?"BLE Sensor":"Local Probe"}function Hr(e){return e==="BLE Sensor"?"BLE":"Local Probe"}function Ir(e,t){let o="<option>Local Probe</option><option>BLE Sensor</option>";e.innerHTML!==o&&(e.innerHTML=o),e.value=t}var ln=_({tag:"zone-sensor-card",render:qr,onMount(e,t){let o=t.querySelector(".zs-probe"),r=t.querySelector(".zs-source"),s=t.querySelector(".zs-ble"),a=t.querySelector(".zs-sync"),i=t.querySelector(".zs-row-ble"),c=t.querySelector(".zs-scan"),p=t.querySelector(".zs-scan-list"),m=0;function b(){return E("selectedZone")}function v(){let d=b();m!==d&&(Pr(a,d),m=d,p.style.display="none");let f=z(l.probe(d)),x=String(z(l.tempSource(d))||""),A=Rr(x),y=z(l.syncTo(d))||"None",R=z(l.ble(d))||"";f&&(o.value=f),Ir(r,A),a.value=y,document.activeElement!==s&&(s.value=R),i.style.display=A==="BLE Sensor"?"":"none"}function w(d){let f=b();(d===l.probe(f)||d===l.tempSource(f)||d===l.syncTo(f)||d===l.ble(f))&&v()}c.addEventListener("click",()=>{if(c.disabled)return;c.disabled=!0,c.textContent="\u2026",p.style.display="",p.innerHTML='<div class="scan-msg">Scanning\u2026</div>';let d=new AbortController,f=setTimeout(()=>d.abort(),8e3);fetch("/api/hv6/v1/ble-scan",{cache:"no-store",signal:d.signal}).then(x=>{if(!x.ok)throw new Error("HTTP "+x.status);return x.json()}).then(x=>{if(clearTimeout(f),c.disabled=!1,c.textContent="Scan",!x.ok||!x.sensors||x.sensors.length===0){p.innerHTML='<div class="scan-msg">No BTHome sensors found nearby. Make sure sensors have fresh batteries and are within range.</div>';return}let A=b(),y=(z(l.ble(A))||"").toUpperCase(),R=N=>String(N).replace(/[&<>"']/g,T=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[T]),Z="";for(let N of x.sensors){let T=N.mac.toUpperCase(),q=N.name?R(N.name):"",L=N.temp_c!=null?N.temp_c.toFixed(1)+"\xB0C":"\u2014",M=N.rssi!=null?N.rssi+" dBm":"",P=N.age_s<60?N.age_s+"s ago":Math.round(N.age_s/60)+"m ago",I="";T===y?I='<span class="ble-badge">assigned to this zone</span>':N.zone>0&&(I='<span class="ble-badge">zone '+N.zone+"</span>");let $=q?`<div class="ble-mac">${q}</div><div class="ble-meta">${T}</div>`:`<div class="ble-mac">${T}</div>`;Z+=`<div class="ble-scan-item">
              <div>
                ${$}
                <div class="ble-meta">${L} &nbsp;${M} &nbsp;${P}</div>
                ${I}
              </div>
              <button class="btn-assign" data-mac="${T}">Assign</button>
            </div>`}p.innerHTML=Z,p.querySelectorAll(".btn-assign").forEach(N=>{N.addEventListener("click",()=>{let T=N.dataset.mac;s.value=T,he(A,"zone_ble_mac",T),p.style.display="none"})})}).catch(x=>{clearTimeout(f),c.disabled=!1,c.textContent="Scan";let A=x&&x.name==="AbortError"?"Scan timed out \u2014 device busy or BLE not responding. Try again.":"Scan failed. Check device connectivity.";p.innerHTML='<div class="scan-msg">'+A+"</div>"})}),o.addEventListener("change",()=>{ge(b(),"zone_probe",o.value)}),r.addEventListener("change",()=>{ge(b(),"zone_temp_source",Hr(r.value))}),a.addEventListener("change",()=>{ge(b(),"zone_sync_to",a.value)}),s.addEventListener("change",()=>{he(b(),"zone_ble_mac",s.value)}),F("selectedZone",v);for(let d=1;d<=6;d++)g(l.probe(d),w),g(l.tempSource(d),w),g(l.syncTo(d),w),g(l.ble(d),w);v()}});var Zr=`
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
`;S("zone-room-card",Zr);var Br=()=>`
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
`,bn=_({tag:"zone-room-card",render:Br,onMount(e,t){let o=t.querySelector(".zr-friendly"),r=t.querySelector(".zr-area"),s=t.querySelector(".zr-spacing"),a=t.querySelector(".zr-pipe"),i=t.querySelectorAll(".wall-btn");function c(){return E("selectedZone")}function p(){let b=c();document.activeElement!==o&&(o.value=oe(b)||""),document.activeElement!==r&&(r.value=h(l.area(b))!=null?String(h(l.area(b))):""),document.activeElement!==s&&(s.value=h(l.spacing(b))!=null?String(h(l.spacing(b))):""),a.value=z(l.pipeType(b))||"Unknown";let v=z(l.exteriorWalls(b))||"None",w=v==="None"?[]:v.split(",").filter(Boolean);i.forEach(d=>{let f=d.dataset.wall;d.classList.toggle("active",f==="None"?w.length===0:w.includes(f))})}function m(b){let v=c();(b===l.area(v)||b===l.spacing(v)||b===l.pipeType(v)||b===l.exteriorWalls(v))&&p()}o.addEventListener("change",()=>{dt(c(),o.value)}),r.addEventListener("change",()=>{ye(c(),"zone_area_m2",r.value)}),s.addEventListener("change",()=>{ye(c(),"zone_pipe_spacing_mm",s.value||"200")}),a.addEventListener("change",()=>{ge(c(),"zone_pipe_type",a.value)}),i.forEach(b=>{b.addEventListener("click",()=>{let v=b.dataset.wall,w=z(l.exteriorWalls(c()))||"None",d=w==="None"?[]:w.split(",").filter(Boolean);if(v==="None")d=[];else{let x=d.indexOf(v);x>=0?d.splice(x,1):d.push(v)}let f=["N","S","E","W"].filter(x=>d.includes(x));he(c(),"zone_exterior_walls",f.length?f.join(","):"None")})}),F("selectedZone",p),F("zoneNames",p);for(let b=1;b<=6;b++)g(l.area(b),m),g(l.spacing(b),m),g(l.pipeType(b),m),g(l.exteriorWalls(b),m);p()}});var Wr=`
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
`;S("flow-diagram",Wr);var te=6,Pt=[60,126,192,258,324,390],Ie=225,be=36,Ee=160,Re=90,ke=be+Ee,re=640,$r=11,et=6,tt=24,Ce=re+20,Tt=re+200,Dt=re+360,Ot=re+420,Rt="#7D8BA7",Ht="#6C7892",jr="#8FCBFF",Vr="#BCDFFF",Gr="#E4D092",Ur="#F2B74C",Xr="#8FCBFF",Yr="#D8E7FF",Jr="#7D8BA7",qt="#B7CBF0",rt="#6C7892",He="#A3B6D9",Qr="#8EA4CD",Kr="#42A5F5",eo="#66BB6A",to="#EF5350";function Ze(e,t,o){var r=Ie+(e-2.5)*$r,s=Pt[e],a=re-ke,i=ke+a*.33,c=ke+a*.67;return"M"+ke+" "+(r-t).toFixed(1)+" C"+i+" "+(r-t).toFixed(1)+" "+c+" "+(s-o).toFixed(1)+" "+re+" "+(s-o).toFixed(1)+" L"+re+" "+(s+o).toFixed(1)+" C"+c+" "+(s+o).toFixed(1)+" "+i+" "+(r+t).toFixed(1)+" "+ke+" "+(r+t).toFixed(1)+"Z"}function ro(e){if(!e)return null;let t=String(e).match(/(\d+)/);if(!t)return null;let o=Number(t[1]);return Number.isFinite(o)&&o>=1&&o<=8?o:null}function oo(e){let t=String(oe(e)||"").trim();if(!t)return"";let o=t.toUpperCase();return o.length>18?o.slice(0,17)+"\u2026":o}function ao(e,t){return t?e==null||Number.isNaN(e)?Ht:e<.15?jr:e<.4?Vr:e<.7?Gr:Ur:Rt}function no(){var e=1160,t=460,o=Ie-Re/2,r=[];r.push('<svg viewBox="0 0 '+e+" "+t+'" preserveAspectRatio="xMidYMid meet">'),r.push("<defs>"),r.push('<pattern id="fdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="1" fill="rgba(92,138,196,0.26)"/></pattern>'),r.push('<radialGradient id="fglow" cx="22%" cy="34%" r="72%"><stop offset="0%" stop-color="rgba(83,168,255,0.2)"/><stop offset="48%" stop-color="rgba(238,161,17,0.1)"/><stop offset="100%" stop-color="transparent"/></radialGradient>'),r.push('<linearGradient id="lbgrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#A06808"/><stop offset="100%" stop-color="#EEA111"/></linearGradient>');for(var s=1;s<=te;s++)r.push('<linearGradient id="rg'+s+'" x1="0" y1="0" x2="1" y2="0">'),r.push('<stop id="rgs'+s+'" offset="0%" stop-color="#EEA111"/>'),r.push('<stop id="rga'+s+'" offset="100%" stop-color="#53A8FF"/>'),r.push("</linearGradient>");r.push("</defs>"),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="#0F213C"/>'),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fdots)" opacity="0.5"/>'),r.push('<rect width="'+e+'" height="'+t+'" rx="22" fill="url(#fglow)"/>');for(var a=1;a<=te;a++){var i=Ze(a-1,et,tt);r.push('<path d="'+i+'" fill="#1E2233" opacity="0.9"/>')}for(a=1;a<=te;a++){var c=Ze(a-1,et,tt);r.push('<path id="fd-path-'+a+'" d="'+c+'" fill="url(#rg'+a+')" opacity="1" style="transition:d .6s ease,opacity .4s ease"/>')}r.push('<line x1="'+re+'" y1="36" x2="'+re+'" y2="'+(t-36)+'" stroke="#EEA111" stroke-width="3" opacity="0.55"/>');var p=5,m=be-p;for(r.push('<rect x="0" y="'+o+'" width="'+m+'" height="'+Re+'" fill="url(#lbgrad)" rx="4"/>'),r.push('<rect x="'+be+'" y="'+o+'" width="'+Ee+'" height="'+Re+'" rx="6" fill="#EEA111"/>'),r.push('<text x="'+(be+Ee/2)+'" y="'+(Ie-10)+'" text-anchor="middle" font-size="20" font-weight="800" fill="#141A27" letter-spacing="2">FLOW</text>'),r.push('<text id="fd-flow-temp" x="'+(be+Ee/2)+'" y="'+(Ie+22)+'" text-anchor="middle" font-size="26" font-weight="800" fill="#141A27" font-family="var(--mono)">---</text>'),r.push('<text id="fd-ret-temp" x="'+(be+Ee/2)+'" y="'+(o+Re+28)+'" text-anchor="middle" font-size="17" font-weight="700" fill="#53A8FF" font-family="var(--mono)">RET ---</text>'),r.push('<text x="'+Ce+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">ZONE</text>'),r.push('<text x="'+Tt+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">TEMP</text>'),r.push('<text x="'+Dt+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">FLOW</text>'),r.push('<text x="'+Ot+'" y="34" font-size="11" fill="'+He+'" font-weight="700" letter-spacing="2">RET</text>'),a=1;a<=te;a++){var b=Pt[a-1];r.push('<text id="fd-zn'+a+'" x="'+Ce+'" y="'+(b+2)+'" font-size="14" fill="#CFE0FF" font-weight="700" letter-spacing="2">ZONE '+a+"</text>"),r.push('<text id="fd-zf'+a+'" x="'+Ce+'" y="'+(b+18)+'" font-size="11" fill="#A8BCE3" font-weight="700" letter-spacing="1">---</text>'),r.push('<text id="fd-zsp'+a+'" x="'+(Ce+82)+'" y="'+(b+18)+'" font-size="11" fill="'+rt+'" font-weight="600" font-family="var(--mono)"></text>'),r.push('<text id="fd-zt'+a+'" x="'+Tt+'" y="'+(b+10)+'" font-size="16" fill="#ECECEC" font-weight="700" font-family="var(--mono)">---\xB0C</text>'),r.push('<text id="fd-zv'+a+'" x="'+Dt+'" y="'+(b+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---%</text>'),r.push('<text id="fd-zr'+a+'" x="'+Ot+'" y="'+(b+10)+'" font-size="16" fill="#AEC0E6" font-weight="700" font-family="var(--mono)">---</text>')}return r.push('<text x="36" y="'+(t-52)+'" font-size="16" font-weight="700" fill="'+Qr+'" letter-spacing="3">\u0394T Flow-Return</text>'),r.push('<text id="fd-dt" x="36" y="'+(t-16)+'" font-size="36" font-weight="800" fill="#EEA111" font-family="var(--mono)">---</text>'),r.push('<text x="'+(e-36)+'" y="'+(t-14)+'" text-anchor="end" font-size="15" fill="#2B3243" font-weight="700" letter-spacing="6">UFH - '+te+" ZONES - HEATVALVE</text>"),r.push("</svg>"),'<div class="flow-wrap">'+r.join("")+"</div>"}var so=()=>`<div class="flow-wrap">${no()}</div>`;_({tag:"flow-diagram",render:so,onMount(e,t){let o={flowEl:t.querySelector("#fd-flow-temp"),retEl:t.querySelector("#fd-ret-temp"),dtEl:t.querySelector("#fd-dt"),zones:new Array(te+1)};for(let s=1;s<=te;s++)o.zones[s]={textTemp:t.querySelector("#fd-zt"+s),textSetpoint:t.querySelector("#fd-zsp"+s),textFlow:t.querySelector("#fd-zv"+s),textRet:t.querySelector("#fd-zr"+s),label:t.querySelector("#fd-zn"+s),friendly:t.querySelector("#fd-zf"+s),path:t.querySelector("#fd-path-"+s)};function r(){let s=h(n.flow),a=h(n.ret),i=o.flowEl,c=o.retEl,p=o.dtEl;if(i.textContent=W(s),c.textContent="RET "+W(a),s!=null&&a!=null){let m=Number(s)-Number(a);p.textContent=m.toFixed(1)+"\xB0C",p.setAttribute("fill",m<3?Kr:m>8?to:eo)}else p.textContent="---";for(let m=1;m<=te;m++){let b=h(l.temp(m)),v=h(l.setpoint(m)),w=h(l.valve(m)),d=H(l.enabled(m)),f=String(z(l.tempSource(m))||"Local Probe"),x=ro(z(l.probe(m))||""),A=x?h(l.probeTemp(x)):null,y=o.zones[m],R=y.textTemp,Z=y.textSetpoint,N=y.textFlow,T=y.textRet,q=y.label,L=y.friendly,M=y.path,P=w!=null?Math.max(0,Math.min(100,Number(w)))/100:0;q.textContent="ZONE "+m;let I=oo(m);L.textContent=I||"---",q.setAttribute("fill",d?Yr:Jr),L.setAttribute("fill",d?qt:rt),Z.setAttribute("fill",d?qt:rt);let $=L.getComputedTextLength?L.getComputedTextLength():0;Z.setAttribute("x",String(Ce+$+8));let U=W(b),j=v!=null?W(v):null;if(R.textContent=U,Z.textContent=j?"("+j+")":"",N.textContent=ue(w),N.setAttribute("fill",ao(P,d)),f!=="Local Probe"&&A!=null&&!Number.isNaN(Number(A))?(T.textContent=W(A),T.setAttribute("fill",d?Xr:Rt)):(T.textContent="---",T.setAttribute("fill",Ht)),!d)M.setAttribute("d",Ze(m-1,1,2)),M.setAttribute("fill","#2A2D38"),M.setAttribute("opacity","0.4");else{let ie=Math.max(3,P*tt),Be=Math.max(1.5,P*et);M.setAttribute("d",Ze(m-1,Be,ie)),M.setAttribute("fill","url(#rg"+m+")"),M.setAttribute("opacity","1")}}}g(n.flow,r),g(n.ret,r),F("zoneNames",r);for(let s=1;s<=te;s++)g(l.temp(s),r),g(l.setpoint(s),r),g(l.valve(s),r),g(l.enabled(s),r),g(l.probe(s),r),g(l.tempSource(s),r);for(let s=1;s<=8;s++)g(l.probeTemp(s),r);r()}});var io=`
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
}`;S("diag-i2c",io);var lo=()=>`
  <div class="diag-i2c">
    <div class="card-title">I2C Diagnostics</div>
    <div class="btn-row">
      <button class="btn" id="btn-i2c-scan">Scan I2C Bus</button>
    </div>
    <pre id="i2c-result">No scan has been run yet.</pre>
  </div>
`,En=_({tag:"diag-i2c",render:lo,onMount(e,t){let o=t.querySelector("#i2c-result");function r(){o.textContent=E("i2cResult")||"No scan has been run yet."}t.querySelector("#btn-i2c-scan").addEventListener("click",()=>{ft()}),F("i2cResult",r),r()}});var co=`
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
`;S("diag-zone",co);function po(e){return e==="HEATING"?"s-heating":e==="IDLE"?"s-idle":e==="FAULT"?"s-fault":""}function It(e){return e!=null?Number(e).toFixed(2)+"x":"---"}function Zt(e){return e!=null?Number(e).toFixed(0):"---"}function go(e){return e!=null?Number(e).toFixed(2)+"C":"---"}var uo=()=>{let e="";for(let t=1;t<=6;t++)e+=`
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
  `},Tn=_({tag:"diag-zone",render:uo,onMount(e,t){function o(s){let a=String(z(l.state(s))||"").toUpperCase()||"OFF",i=H(l.enabled(s)),c=t.querySelector('[data-dz-state="'+s+'"]');c.textContent=i?a:"OFF",c.className="dz-state-badge"+(i?" "+po(a):""),t.querySelector('[data-dz-temp="'+s+'"]').textContent=W(h(l.temp(s))),t.querySelector('[data-dz-valve="'+s+'"]').textContent=ue(h(l.valve(s))),t.querySelector('[data-dz-ret="'+s+'"]').textContent=W(h(n.ret)),t.querySelector('[data-dz-orip="'+s+'"]').textContent=Zt(h(l.motorOpenRipples(s))),t.querySelector('[data-dz-crip="'+s+'"]').textContent=Zt(h(l.motorCloseRipples(s))),t.querySelector('[data-dz-ofac="'+s+'"]').textContent=It(h(l.motorOpenFactor(s))),t.querySelector('[data-dz-cfac="'+s+'"]').textContent=It(h(l.motorCloseFactor(s))),t.querySelector('[data-dz-ph="'+s+'"]').textContent=go(h(l.preheatAdvance(s)));let p=String(z(l.motorLastFault(s))||"").toUpperCase(),m=p&&p!=="NONE"&&p!=="OK",b=t.querySelector('[data-dz-faultrow="'+s+'"]');b.style.display=m?"flex":"none",m&&(t.querySelector('[data-dz-fault="'+s+'"]').textContent=p)}for(let s=1;s<=6;s++){let a=s,i=()=>o(a);g(l.state(a),i),g(l.enabled(a),i),g(l.temp(a),i),g(l.valve(a),i),g(n.ret,i),g(l.motorOpenRipples(a),i),g(l.motorCloseRipples(a),i),g(l.motorOpenFactor(a),i),g(l.motorCloseFactor(a),i),g(l.preheatAdvance(a),i),g(l.motorLastFault(a),i),o(a)}function r(){let s=t.querySelector("[data-preheat-badge]"),a=s.querySelector(".card-title-preheat-dot"),i=s.querySelector("span:last-child"),p=(z(n.simplePreheatEnabled)||"off").toString().toLowerCase()==="on";s.classList.toggle("on",p),s.classList.toggle("off",!p),a.classList.toggle("on",p),a.classList.toggle("off",!p),i.textContent=p?"Preheat: On":"Preheat: Off"}g(n.simplePreheatEnabled,r),r()}});var mo=`
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
`;S("diag-activity",mo);var bo=()=>`
  <div class="diag-activity">
    <div class="card-title">General Activity / Log</div>
    <div class="diag-log"></div>
  </div>
`;function fo(e,t){if(!t||!t.length){e.innerHTML='<div class="diag-log-empty">No activity yet.</div>';return}let o="";for(let r=t.length-1;r>=0;r--)o+='<div class="diag-log-item"><span class="diag-log-time">'+t[r].time+'</span><span class="diag-log-msg">'+t[r].msg+"</span></div>";e.innerHTML=o}var Rn=_({tag:"diag-activity",render:bo,onMount(e,t){let o=t.querySelector(".diag-log");function r(){fo(o,ct())}F("activityLog",r),r()}});var xo=`
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
`;S("diag-manual-badge",xo);var vo=()=>`
  <div class="diag-manual-badge" role="status" aria-live="polite">
    <span class="diag-manual-dot"></span>
    <span class="diag-manual-text">Manual Mode Active - Automatic Management Suspended</span>
  </div>
`,Wn=_({tag:"diag-manual-badge",render:vo,onMount(e,t){let o=t.classList.contains("diag-manual-badge")?t:t.querySelector(".diag-manual-badge");function r(){let s=!!E("manualMode");o&&o.classList.toggle("on",s)}F("manualMode",r),r()}});var ho=`
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
`;S("diag-zone-motor",ho);var yo=e=>{let t=e.zone||E("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">Zone "+r+"</option>";return`
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
  `},Yn=_({tag:"diag-zone-motor-card",render:yo,onMount(e,t){let o=Number(e.zone||E("selectedZone")||1),r=!!E("manualMode"),s=t.querySelector(".manual-mode-toggle"),a=t.querySelector(".motor-gated"),i=t.querySelector(".motor-zone-select"),c=t.querySelector(".motor-target-input"),p=t.querySelector(".motor-open-btn"),m=t.querySelector(".motor-close-btn"),b=t.querySelector(".motor-stop-btn");function v(f){r=!!f,s&&(s.classList.toggle("on",r),s.setAttribute("aria-checked",r?"true":"false")),a&&a.classList.toggle("locked",!r),[i,c,p,m,b].forEach(x=>{x&&(x.disabled=!r)})}function w(){let f=!r;if(v(f),f){Ge(!0);for(let x=1;x<=6;x++)Ve(x)}else Ge(!1)}function d(){let f=h(l.motorTarget(o));c&&f!=null?c.value=Number(f).toFixed(0):c&&(c.value="0")}i==null||i.addEventListener("change",()=>{o=Number(i.value||1),d()}),s==null||s.addEventListener("click",w),s==null||s.addEventListener("keydown",f=>{f.key!==" "&&f.key!=="Enter"||(f.preventDefault(),w())});for(let f=1;f<=6;f++)g(l.motorTarget(f),d);d(),v(r),F("manualMode",()=>{v(!!E("manualMode"))}),c==null||c.addEventListener("change",f=>{if(!r)return;let x=f.target.value;vt(o,x)}),p==null||p.addEventListener("click",()=>{r&&ht(o,1e4)}),m==null||m.addEventListener("click",()=>{r&&yt(o,1e4)}),b==null||b.addEventListener("click",()=>{r&&Ve(o)})}});var wo=`
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
`;S("diag-zone-recovery",wo);var zo=e=>{let t=e.zone||E("selectedZone")||1,o="";for(let r=1;r<=6;r++)o+='<option value="'+r+'"'+(r===t?" selected":"")+">Zone "+r+"</option>";return`
    <div class="diag-zone-recovery">
      <div class="card-title">Motor Recovery</div>
      <div class="cfg-row">
        <span class="lbl">Motor</span>
        <select class="sel recovery-zone-select">${o}</select>
      </div>
      <div class="btn-row">
        <button class="btn recovery-fault-btn">Reset Fault</button>
        <button class="btn warn recovery-factors-btn">Reset Factors</button>
        <button class="btn accent recovery-relearn-btn">Reset + Relearn</button>
      </div>
    </div>
  `},rs=_({tag:"diag-zone-recovery-card",render:zo,onMount(e,t){let o=Number(e.zone||E("selectedZone")||1),r=t.querySelector(".recovery-zone-select"),s=t.querySelector(".recovery-fault-btn"),a=t.querySelector(".recovery-factors-btn"),i=t.querySelector(".recovery-relearn-btn");r==null||r.addEventListener("change",()=>{o=Number(r.value||1)}),s==null||s.addEventListener("click",()=>{wt(o)}),a==null||a.addEventListener("click",()=>{confirm("Reset learned factors for Zone "+o+"?")&&zt(o)}),i==null||i.addEventListener("click",()=>{confirm("Reset + relearn motor for Zone "+o+"?")&&_t(o)})}});var _o=`
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
`;S("settings-manifold-card",_o);var So=()=>{let e="";for(let o=1;o<=8;o++)e+="<option>Probe "+o+"</option>";let t="";for(let o=1;o<=8;o++)t+='<div class="probe-cell"><div class="probe-name">Probe '+o+'</div><div class="probe-temp" data-probe="'+o+'">---</div></div>';return`
    <div class="settings-manifold-card">
      <div class="card-title">Manifold Configuration</div>
      <div class="cfg-row"><span class="lbl">Manifold Type</span>
        <select class="sel sm-type"><option value="NO (Normally Open)">Normally Open (NO)</option><option value="NC (Normally Closed)">Normally Closed (NC)</option></select>
      </div>
      <div class="cfg-row"><span class="lbl">Flow Probe</span><select class="sel sm-flow">${e}</select></div>
      <div class="cfg-row"><span class="lbl">Return Probe</span><select class="sel sm-ret">${e}</select></div>
      <div class="probe-grid">${t}</div>
    </div>
  `},cs=_({tag:"settings-manifold-card",render:So,onMount(e,t){let o=t.querySelector(".sm-type"),r=t.querySelector(".sm-flow"),s=t.querySelector(".sm-ret");function a(){o.value=z(n.manifoldType)||"NO (Normally Open)",r.value=z(n.manifoldFlowProbe)||"Probe 7",s.value=z(n.manifoldReturnProbe)||"Probe 8";for(let i=1;i<=8;i++){let c=t.querySelector('[data-probe="'+i+'"]'),p=h(l.probeTemp(i));c&&(c.textContent=W(p))}}o.addEventListener("change",()=>Y("manifold_type",o.value)),r.addEventListener("change",()=>Y("manifold_flow_probe",r.value)),s.addEventListener("change",()=>Y("manifold_return_probe",s.value)),g(n.manifoldType,a),g(n.manifoldFlowProbe,a),g(n.manifoldReturnProbe,a);for(let i=1;i<=8;i++)g(l.probeTemp(i),a);a()}});var ko=`
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
`;S("settings-control-card",ko);var Eo=()=>`
  <div class="settings-control-stack">
    <div class="settings-card settings-functionality-card">
      <div class="card-title">Functionality</div>
      <div class="toggle-row">
        <span class="toggle-label">Motor Drivers</span>
        <div class="ui-toggle drivers-toggle" role="switch" aria-label="Toggle motor drivers"></div>
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
`,xs=_({tag:"settings-control-card",render:Eo,onMount(e,t){let o=t.querySelector(".drivers-toggle"),r=o.closest(".toggle-row");function s(){return H(n.drivers)}function a(){let i=s();o.classList.toggle("on",i),r.classList.toggle("is-on",i),o.setAttribute("aria-checked",i?"true":"false")}o.addEventListener("click",()=>{Te(!s())}),g(n.drivers,a),a(),t.querySelector(".sc-reset-probe-map").addEventListener("click",()=>{ae("reset_1wire_probe_map_reboot")}),t.querySelector(".sc-dump-1wire").addEventListener("click",()=>{ae("dump_1wire_probe_diagnostics")}),t.querySelector(".sc-restart").addEventListener("click",()=>{ae("restart")})}});var Co=`
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
`;S("settings-motor-calibration-card",Co);var fe=[{cls:"safe-runtime",key:"generic_runtime_limit_seconds",id:n.genericRuntimeLimitSeconds,label:"Max Safe Runtime",unit:"s"},{cls:"close-threshold",key:"close_threshold_multiplier",id:n.closeThresholdMultiplier,label:"Close Endstop Threshold",unit:"x"},{cls:"close-slope-threshold",key:"close_slope_threshold",id:n.closeSlopeThreshold,label:"Close Endstop Slope",unit:"mA/s"},{cls:"close-slope-floor",key:"close_slope_current_factor",id:n.closeSlopeCurrentFactor,label:"Close Endstop Slope Floor",unit:"x"},{cls:"open-threshold",key:"open_threshold_multiplier",id:n.openThresholdMultiplier,label:"Open Endstop Threshold",unit:"x"},{cls:"open-slope-threshold",key:"open_slope_threshold",id:n.openSlopeThreshold,label:"Open Endstop Slope",unit:"mA/s"},{cls:"open-slope-floor",key:"open_slope_current_factor",id:n.openSlopeCurrentFactor,label:"Open Endstop Slope Floor",unit:"x"},{cls:"open-ripple-limit",key:"open_ripple_limit_factor",id:n.openRippleLimitFactor,label:"Open Ripple Limit",unit:"x"},{cls:"relearn-movements",key:"relearn_after_movements",id:n.relearnAfterMovements,label:"Relearn After Movements",unit:"count"},{cls:"relearn-hours",key:"relearn_after_hours",id:n.relearnAfterHours,label:"Relearn After Hours",unit:"h"},{cls:"learn-min-samples",key:"learned_factor_min_samples",id:n.learnedFactorMinSamples,label:"Learned Factor Min Samples",unit:"count"},{cls:"learn-max-deviation",key:"learned_factor_max_deviation_pct",id:n.learnedFactorMaxDeviationPct,label:"Learned Factor Max Deviation",unit:"%"}],Ao=()=>{let e=`
    <div class="cfg-row full">
      <span class="lbl">Motor Type (Default Profile)</span>
      <select class="sel smc-profile">
        <option value="Generic">Generic</option>
        <option value="HmIP VdMot">HmIP VdMot</option>
      </select>
      <span class="unit">Applied as default motor profile</span>
    </div>
    <div class="runtime-note">HmIP-VDMot safety: runtime is fixed to 40s to prevent piston overtravel. Generic allows editable runtime.</div>
  `,t="";for(let o=0;o<fe.length;o++){let r=fe[o];t+='<div class="cfg-row"><span class="lbl">'+r.label+'</span><input type="number" class="txt smc-'+r.cls+'" value="0" step="0.1"><span class="unit">'+r.unit+"</span></div>"}return`
    <div class="settings-motor-cal-card">
      <div class="card-title">Motor Calibration & Learning</div>
      <div class="hint">Default starting thresholds and learning bounds used by the motor controller.</div>
      <div class="cfg-grid">${e}${t}</div>
    </div>
  `};function Lo(e){return e==="learned_factor_min_samples"||e==="generic_runtime_limit_seconds"||e==="relearn_after_movements"||e==="relearn_after_hours"}function Bt(e,t){let o=Number(t);return Number.isFinite(o)?Lo(e)?String(Math.round(o)):o.toFixed(2):"0"}var Ss=_({tag:"settings-motor-calibration-card",render:Ao,onMount(e,t){let o=t.querySelector(".smc-profile"),r=t.querySelector(".smc-safe-runtime");function s(i){if(i==="HmIP VdMot"&&J("hmip_runtime_limit_seconds",40),i==="Generic"){let c=Number(h(n.genericRuntimeLimitSeconds));(!Number.isFinite(c)||c<=0)&&J("generic_runtime_limit_seconds",45)}}function a(){let i=z(n.motorProfileDefault)||"HmIP VdMot";o&&(o.value=i),r&&(i==="HmIP VdMot"?(r.value="40",r.disabled=!0):(r.value=Bt("generic_runtime_limit_seconds",h(n.genericRuntimeLimitSeconds)),r.disabled=!1));for(let c=0;c<fe.length;c++){let p=fe[c],m=t.querySelector(".smc-"+p.cls);m&&p.key!=="generic_runtime_limit_seconds"&&(m.value=Bt(p.key,h(p.id)))}}o&&(o.addEventListener("change",()=>{Y("motor_profile_default",o.value),s(o.value)}),g(n.motorProfileDefault,a));for(let i=0;i<fe.length;i++){let c=fe[i],p=t.querySelector(".smc-"+c.cls);p&&(p.addEventListener("change",()=>{if(c.key==="generic_runtime_limit_seconds"){if((z(n.motorProfileDefault)||"HmIP VdMot")!=="Generic")return;J("generic_runtime_limit_seconds",p.value);return}J(c.key,p.value)}),g(c.id,a))}g(n.genericRuntimeLimitSeconds,a),g(n.hmipRuntimeLimitSeconds,a),s(z(n.motorProfileDefault)||"HmIP VdMot"),a()}});var Fo=`
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

.settings-asgard-card .setpoint-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 14px;
  border: 1px solid var(--control-border);
  border-radius: 12px;
  background: var(--control-bg);
}

.settings-asgard-card .setpoint-box .note {
  margin-top: 0;
}

.settings-asgard-card .setpoint-val {
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: .3px;
  color: var(--accent);
  line-height: 1;
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
`;S("settings-asgard-card",Fo);var Mo=()=>`
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

    <div class="section-title">Recommended setpoint</div>
    <div class="setpoint-box">
      <span class="setpoint-val sa-st-setpoint">\u2014</span>
      <span class="note">Fixed value to set as the virtual thermostat setpoint in Asgard \u2014 the area-weighted target of all enabled zones (derived from static zone settings, not live status).</span>
    </div>

    <div class="section-title">Status</div>
    <div class="status-grid">
      <span>Peer</span><span class="val sa-st-peer">n/a</span>
      <span>Last push</span><span class="val sa-st-push">\u2014</span>
      <span>Zones weighted</span><span class="val sa-st-zones">\u2014</span>
      <span>Last error</span><span class="val sa-st-err">\u2014</span>
    </div>
  </div>
`,Ms=_({tag:"settings-asgard-card",render:Mo,onMount(e,t){let o=t.querySelector(".asgard-role-badge"),r=t.querySelector(".sa-enable").closest(".enable-row"),s=t.querySelector(".sa-coord").closest(".enable-row"),a=t.querySelector(".sa-enable"),i=t.querySelector(".sa-coord"),c=t.querySelector(".sa-host"),p=t.querySelector(".sa-port"),m=t.querySelector(".sa-entity"),b=t.querySelector(".sa-peer"),v=t.querySelector(".sa-interval"),w=t.querySelector(".sa-st-peer"),d=t.querySelector(".sa-st-push"),f=t.querySelector(".sa-st-setpoint"),x=t.querySelector(".sa-st-zones"),A=t.querySelector(".sa-st-err");function y(L,M,P,I,$){return L.addEventListener("click",()=>{let U=H(P),j=U?"off":"on";u(P,{state:j}),Y(I,j).catch(ie=>{console.error(`[Asgard] Failed to update ${$}:`,ie),u(P,{state:U?"on":"off"})})}),()=>{let U=H(P);M.classList.toggle("is-on",U),M.classList.toggle("is-off",!U),L.setAttribute("aria-checked",U?"true":"false")}}let R=y(a,r,n.asgardEnabled,"asgard_enabled","enabled"),Z=y(i,s,n.asgardCoordinator,"asgard_coordinator","coordinator");function N(L,M,P){L.addEventListener("blur",()=>{let I=L.value.trim();u(M,{state:I}),xt(P,I).catch($=>console.error(`[Asgard] Failed to update ${P}:`,$))})}N(c,n.asgardHost,"asgard_host"),N(m,n.asgardEntityName,"asgard_entity_name"),N(b,n.asgardPeerHost,"asgard_peer_host"),p.addEventListener("blur",()=>{let L=parseInt(p.value,10);L>=1&&L<=65535&&(u(n.asgardPort,{value:L}),J("asgard_port",L).catch(M=>console.error("[Asgard] Failed to update port:",M)))}),v.addEventListener("blur",()=>{let L=parseInt(v.value,10);L>=5&&L<=3600&&(u(n.asgardPushIntervalS,{value:L}),J("asgard_push_interval_s",L).catch(M=>console.error("[Asgard] Failed to update push_interval_s:",M)))});function T(){let L=z(n.asgardRole)||"slave";o.textContent=L,o.className="asgard-role-badge "+(L==="master"?"master":"slave");let M=z(n.asgardPeerStatus)||"n/a";w.textContent=M,w.classList.toggle("warn",M==="stale"||M==="unreachable");let P=h(n.asgardLastPushC),I=h(n.asgardLastPushAgeS);if(P!=null&&Number.isFinite(P)&&I!=null){let Be=I<120?`${Math.round(I)}s ago`:`${Math.round(I/60)}m ago`;d.textContent=`${P.toFixed(2)}\xB0C (${Be})`}else d.textContent="\u2014";let $=h(n.asgardSetpointC);f.textContent=$!=null&&Number.isFinite($)?`${$.toFixed(1)}\xB0C`:"\u2014";let U=h(n.asgardLocalZones),j=h(n.asgardPeerZones);x.textContent=U!=null?`${U} local + ${j||0} peer`:"\u2014";let ie=z(n.asgardLastError);A.textContent=ie||"\u2014",A.classList.toggle("warn",!!ie)}function q(){let L=z(n.asgardHost),M=z(n.asgardEntityName),P=z(n.asgardPeerHost),I=h(n.asgardPort),$=h(n.asgardPushIntervalS);document.activeElement!==c&&L!=null&&(c.value=L),document.activeElement!==m&&M!=null&&(m.value=M),document.activeElement!==b&&P!=null&&(b.value=P),document.activeElement!==p&&I!=null&&(p.value=I||80),document.activeElement!==v&&$!=null&&(v.value=$||30)}g(n.asgardEnabled,R),g(n.asgardCoordinator,Z),g(n.asgardRole,T),g(n.asgardPeerStatus,T),g(n.asgardLastPushC,T),g(n.asgardSetpointC,T),g(n.asgardLastPushAgeS,T),g(n.asgardLocalZones,T),g(n.asgardPeerZones,T),g(n.asgardLastError,T),g(n.asgardHost,q),g(n.asgardEntityName,q),g(n.asgardPeerHost,q),g(n.asgardPort,q),g(n.asgardPushIntervalS,q),R(),Z(),T(),q()}});var Wt=[1,2,3,4,5,6],No=`
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
`;S("settings-forecast-card",No);var To=e=>`
  <tr data-zone="${e}">
    <td>Zone ${e}</td>
    <td><input class="fc-wind" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-solar" type="number" min="0" max="1" step="0.05" /></td>
    <td><input class="fc-lead" type="number" min="0" max="48" step="1" /></td>
    <td class="offset-cell fc-offset">\u2014</td>
  </tr>
`,Do=()=>`
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
        ${Wt.map(To).join("")}
      </tbody>
    </table>
    <div class="note fc-note">Wind (0\u20131) = how exposed this room's outside walls are to wind-driven heat loss (0 sheltered/internal, 1 fully exposed). Solar (0\u20131) = how much passive sun this room gains, which reduces its preload (0 none, 1 strong). Lead h = how many hours ahead to start charging the slab before a forecast cold/wind peak (fixed per room, not learned). The live wind speed, direction and sun come from the forecast; the room's exterior walls (set in the zone sensor card) decide which wind directions count.</div>
  </div>
`,Rs=_({tag:"settings-forecast-card",render:Do,onMount(e,t){let o=t.querySelector(".fc-badge"),r=t.querySelector(".enable-row"),s=t.querySelector(".fc-enable"),a=t.querySelector(".fc-lat"),i=t.querySelector(".fc-lon"),c=t.querySelector(".fc-threshold"),p=t.querySelector(".fc-maxoffset");s.addEventListener("click",()=>{let d=H(n.forecastEnabled),f=d?"off":"on";u(n.forecastEnabled,{state:f}),Y("forecast_enabled",f).catch(x=>{console.error("[Forecast] toggle failed:",x),u(n.forecastEnabled,{state:d?"on":"off"})})});function m(d,f,x,A,y){d.addEventListener("blur",()=>{let R=parseFloat(d.value);!Number.isNaN(R)&&R>=A&&R<=y&&(u(x,{value:R}),J(f,R).catch(Z=>console.error(`[Forecast] ${f} failed:`,Z)))})}m(a,"forecast_latitude",n.forecastLatitude,-90,90),m(i,"forecast_longitude",n.forecastLongitude,-180,180),m(c,"forecast_load_threshold",n.forecastLoadThreshold,.1,10),m(p,"forecast_max_offset_c",n.forecastMaxOffsetC,0,3),t.querySelectorAll(".fc-zone-body tr").forEach(d=>{let f=parseInt(d.getAttribute("data-zone"),10),x=d.querySelector(".fc-wind"),A=d.querySelector(".fc-solar"),y=d.querySelector(".fc-lead"),R=(Z,N,T,q,L)=>{Z.addEventListener("blur",()=>{let M=parseFloat(Z.value);!Number.isNaN(M)&&M>=q&&M<=L&&(u(T(f),{value:M}),ye(f,N,M).catch(P=>console.error(`[Forecast] z${f} ${N} failed:`,P)))})};R(x,"zone_wind_exposure",l.windExposure,0,1),R(A,"zone_solar_gain",l.solarGain,0,1),R(y,"zone_thermal_lead_h",l.thermalLeadH,0,48)});function b(){let d=z(n.forecastStatus)||"disabled";o.textContent=d,o.className="fc-badge",d==="ok"?o.classList.add("ok"):(d==="stale"||d.indexOf("external")>=0)&&o.classList.add("external");let f=H(n.forecastEnabled);r.classList.toggle("is-on",f),r.classList.toggle("is-off",!f),s.setAttribute("aria-checked",f?"true":"false")}function v(){t.querySelectorAll(".fc-zone-body tr").forEach(d=>{let f=parseInt(d.getAttribute("data-zone"),10),x=d.querySelector(".fc-offset"),A=h(l.forecastOffset(f)),y=h(l.forecastPeakH(f));A!=null&&A>.01?(x.textContent=`+${A.toFixed(1)}\xB0`+(y!=null&&y>=0?` (${y}h)`:""),x.classList.add("active")):(x.textContent="\u2014",x.classList.remove("active"))})}function w(){let d=(f,x,A)=>{let y=h(x);document.activeElement!==f&&y!=null&&(f.value=y||A)};d(a,n.forecastLatitude,""),d(i,n.forecastLongitude,""),d(c,n.forecastLoadThreshold,1),d(p,n.forecastMaxOffsetC,1.5),t.querySelectorAll(".fc-zone-body tr").forEach(f=>{let x=parseInt(f.getAttribute("data-zone"),10);d(f.querySelector(".fc-wind"),l.windExposure(x),.5),d(f.querySelector(".fc-solar"),l.solarGain(x),.3),d(f.querySelector(".fc-lead"),l.thermalLeadH(x),4)})}g(n.forecastStatus,b),g(n.forecastEnabled,b),g(n.forecastLatitude,w),g(n.forecastLongitude,w),g(n.forecastLoadThreshold,w),g(n.forecastMaxOffsetC,w),Wt.forEach(d=>{g(l.windExposure(d),w),g(l.solarGain(d),w),g(l.thermalLeadH(d),w),g(l.forecastOffset(d),v)}),b(),v(),w()}});var Oo=`
.smart-preheat-card {
  background: var(--panel-bg-vibrant);
  border: 1px solid var(--panel-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--panel-shadow);
}

.smart-preheat-card .card-title {
  font-size: .84rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.1px;
  color: var(--accent);
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--panel-border);
}

.smart-preheat-card .toggle-row {
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

.smart-preheat-card .toggle-label {
  font-size: .88rem;
  font-weight: 700;
  color: var(--text);
}

.smart-preheat-card .toggle-row.is-on {
  border-color: rgba(100,255,100,.4);
  background: rgba(45,110,45,.2);
}

.smart-preheat-card .ui-toggle {
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

.smart-preheat-card .ui-toggle::after {
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

.smart-preheat-card .ui-toggle.on {
  background: rgba(121, 209, 126, 0.25);
  border-color: rgba(121, 209, 126, 0.5);
}

.smart-preheat-card .ui-toggle.on::after {
  transform: translateX(22px);
  background: #0f213c;
}

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

.smart-preheat-card .num-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 10px;
}

.smart-preheat-card .num-row .lbl {
  display: block;
  color: var(--text-secondary);
  font-size: .74rem;
  font-weight: 700;
  letter-spacing: .45px;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.smart-preheat-card .num-row .inp {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--control-border);
  background: var(--control-bg);
  color: var(--text);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: .88rem;
}

.smart-preheat-card .note {
  color: var(--text-secondary);
  font-size: .75rem;
  margin-top: 6px;
  line-height: 1.4;
}
`;S("smart-preheat-card",Oo);var qo=()=>`
  <div class="smart-preheat-card">
    <div class="card-title">Preheat</div>
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
    <div class="note">Simple Preheat learns a per-zone head-start so a room reaches setpoint on time despite slab lag. Preheat Absorption keeps satisfied zones open while an external optimizer pre-buffers hot water.</div>
  </div>
`,js=_({tag:"smart-preheat-card",render:qo,onMount(e,t){let o=t.querySelector(".preheat-toggle"),r=o.closest(".toggle-row");function s(){let d=String(z(n.simplePreheatEnabled)||"").toLowerCase();return d==="on"||d==="true"||d==="1"||d==="enabled"}function a(){let d=s();o.classList.toggle("on",d),r.classList.toggle("is-on",d),o.setAttribute("aria-checked",d?"true":"false")}o.addEventListener("click",()=>{let d=!s();Y("simple_preheat_enabled",d?"on":"off")}),g(n.simplePreheatEnabled,a),a();let i=t.querySelector(".absorb-toggle"),c=i.closest(".toggle-row"),p=t.querySelector(".absorb-badge"),m=t.querySelector(".absorb-band"),b=t.querySelector(".absorb-delta");function v(){let d=H(n.preheatAbsorbEnabled);i.classList.toggle("on",d),c.classList.toggle("is-on",d),i.setAttribute("aria-checked",d?"true":"false");let f=String(z(n.preheatAbsorbing)||"").toLowerCase()==="active";p.textContent=f?"active":"idle",p.classList.toggle("active",f)}i.addEventListener("click",()=>{let d=H(n.preheatAbsorbEnabled)?"off":"on";u(n.preheatAbsorbEnabled,{state:d}),Y("preheat_absorb_enabled",d)});function w(){let d=h(n.preheatAbsorbBandC),f=h(n.preheatDetectDeltaC);document.activeElement!==m&&d!=null&&(m.value=d),document.activeElement!==b&&f!=null&&(b.value=f)}m.addEventListener("blur",()=>{let d=parseFloat(m.value);d>=0&&d<=5&&(u(n.preheatAbsorbBandC,{value:d}),J("preheat_absorb_band_c",d))}),b.addEventListener("blur",()=>{let d=parseFloat(b.value);d>=2&&d<=25&&(u(n.preheatDetectDeltaC,{value:d}),J("preheat_detect_delta_c",d))}),g(n.preheatAbsorbEnabled,v),g(n.preheatAbsorbing,v),g(n.preheatAbsorbBandC,w),g(n.preheatDetectDeltaC,w),v(),w()}});var Po=`
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
.settings-layout,
.smart-heating-layout {
  display: grid;
  gap: 14px;
}

.smart-heating-layout {
  grid-template-columns: 1.15fr .85fr;
  align-items: start;
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
  .settings-layout,
  .smart-heating-layout { grid-template-columns: 1fr; }

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
`;S("app-root",Po);var Ro=e=>`
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
      <section class="sec" data-section="smart-heating">
        <div class="smart-heating-layout">
          <div class="smart-heating-preheat-slot"></div>
          <div class="smart-heating-forecast-slot"></div>
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
          <div class="settings-asgard-slot"></div>
        </div>
      </section>
      <div class="ftr">HEATVALVE-6 \xB7 UFH CONTROLLER</div>
    </main>
  </div>
`;_({tag:"app-root",render:Ro,onMount(e,t){t.querySelector(".hdr").appendChild(O("hv6-header")),t.querySelector(".overview-flow").appendChild(O("flow-diagram")),t.querySelector(".overview-timeline").appendChild(O("zone-state-timeline")),t.querySelector(".overview-connectivity").appendChild(O("connectivity-card")),t.querySelector(".overview-flow-return").appendChild(O("graph-widgets",{variant:"flow-return"})),t.querySelector(".overview-demand").appendChild(O("graph-widgets",{variant:"demand"})),t.querySelector(".zone-selector").appendChild(O("zone-grid")),t.querySelector(".zone-detail-slot").appendChild(O("zone-detail",{zone:E("selectedZone")})),t.querySelector(".zone-sensor-slot").appendChild(O("zone-sensor-card")),t.querySelector(".zone-room-slot").appendChild(O("zone-room-card")),t.querySelector(".settings-manifold-slot").appendChild(O("settings-manifold-card")),t.querySelector(".settings-control-slot").appendChild(O("settings-control-card")),t.querySelector(".settings-motor-cal-slot").appendChild(O("settings-motor-calibration-card")),t.querySelector(".settings-asgard-slot").appendChild(O("settings-asgard-card")),t.querySelector(".smart-heating-preheat-slot").appendChild(O("smart-preheat-card")),t.querySelector(".smart-heating-forecast-slot").appendChild(O("settings-forecast-card")),t.querySelector(".diag-manual-badge-slot").appendChild(O("diag-manual-badge"));let o=t.querySelector(".diag-layout");o.appendChild(O("diag-i2c")),o.appendChild(O("diag-activity")),o.appendChild(O("diag-zone"));let r=E("selectedZone")||1;o.appendChild(O("diag-zone-motor-card",{zone:r})),o.appendChild(O("diag-zone-recovery-card",{zone:r}));let s=t.querySelectorAll(".sec");function a(){let i=E("section");s.forEach(c=>{c.classList.toggle("active",c.getAttribute("data-section")===i)})}F("section",a),a()}});function Ho(){let e=document.getElementById("app");if(!e)throw new Error("Dashboard root #app not found");e.innerHTML="",e.appendChild(O("app-root")),Ye()}Ho();})();

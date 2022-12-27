import {LitElement, html,css} from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

import { CARD_VERSION } from './const.js';



class FootballCardEditor extends LitElement {
    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }
    
    get _AllGamesentity() {
        if (this.config) {
            return this.config.AllGamesentity || '';
        }
        
        return '';
    }

    get _Leaguesentity() {
        if (this.config) {
            return this.config.Leaguesentity || '';
        }
        
        return '';
    }
       
    get _Classificationentity() {
        if (this.config) {
            return this.config.Classificationentity || '';
        }
        
        return '';
    }

    setConfig(config) {
        this.config = config;
    }
    
    configChanged(config) {
        const e = new Event('config-changed', {
            bubbles: true,
            composed: true,
        });
        
        e.detail = {config: config};
        
        this.dispatchEvent(e);
    }
    
    getEntitiesByType(type) {
        return this.hass
            ? Object.keys(this.hass.states).filter(entity => entity.substr(0, entity.indexOf('.')) === type)
            : [];
    }

    isNumeric(v) {
        return !isNaN(parseFloat(v)) && isFinite(v);
    }
    
    valueChanged(e) {
        if (
            !this.config
            || !this.hass
            || (this[`_${e.target.configValue}`] === e.target.value)
        ) {
            return;
        }
        
        if (e.target.configValue) {
            if (e.target.value === '') {
                if (!['entity', 'show_completed'].includes(e.target.configValue)) {
                    delete this.config[e.target.configValue];
                }
            } else {
                this.config = {
                    ...this.config,
                    [e.target.configValue]: e.target.checked !== undefined
                        ? e.target.checked
                        : this.isNumeric(e.target.value) ? parseFloat(e.target.value) : e.target.value,
                };
            }
        }
        
        this.configChanged(this.config);
    }
    
    render() {
        if (!this.hass) {
            return html``;
        }
        
        const entities = this.getEntitiesByType('sensor');

        return html`<div class="card-config">

            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Leagues Games Entity (required)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'Leaguesentity'}
                    .value=${this._Leaguesentity}
                >
                    ${entities.map(entity => {
                        return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>



            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="All Games Entity (required)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'AllGamesentity'}
                    .value=${this._AllGamesentity}
                >
                    ${entities.map(entity => {
                        return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>

           

            <div class="option">
                <ha-select
                    naturalMenuWidth
                    fixedMenuPosition
                    label="Classification Entity (required)"
                    @selected=${this.valueChanged}
                    @closed=${(event) => event.stopPropagation()}
                    .configValue=${'Classificationentity'}
                    .value=${this._Classificationentity}
                >
                    ${entities.map(entity => {
                        return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                    })}
                </ha-select>
            </div>
        </div>`;
    }
    
    static get styles() {
        return css`
            .card-config ha-select {
                width: 100%;
            }
            
            .option {
                display: flex;
                align-items: center;
                padding: 5px;
            }

        ` ;
    }
}


class FootballCard extends LitElement  {
    constructor() {
        super();

        this.itemsCompleted = [];
    }

    static get properties() {
        return {
            hass: Object,
            config: Object,
        };
    }
    
    static getConfigElement() {
        return document.createElement('football-card-editor');
    }

    setConfig(config) {
        if (!config.AllGamesentity) {
            throw new Error('All Games Entity is not set!');
        }

        if (!config.Leaguesentity) {
            throw new Error('Leagues Entity is not set!');
        }
       
        if (!config.Classificationentity) {
            throw new Error('Classification Entity is not set!');
        }
        this.config = config;
    }

    getCardSize() {
        return this.hass ? (this.hass.states[this.config.entity].attributes.items.length || 1) : 1;
    }
    
    weekdayClick(item) {
       
        let AllGamesentitystate = this.hass.states[this.config.AllGamesentity] || undefined;
        let itemsAllGamesDate = AllGamesentitystate.attributes.weekday || [];

        const sweeterArray = itemsAllGamesDate.map(itemsGame => {
            this.shadowRoot.getElementById("weekday"+itemsGame.name).classList.remove("G"); // remove clase 
            this.shadowRoot.getElementById("games"+ itemsGame.name).style.display = "none";
        })

       
        this.shadowRoot.getElementById('weekday' + item).classList.add("G");
        this.shadowRoot.getElementById("games"+ item).style.display = "flex";


    }

    divChanged(item) {
        var x =  this.shadowRoot.getElementById("itemsLeagues");
      
            if (x.style.display === 'none') {
                x.style.display = 'block';
            } else {
                x.style.display = 'none';
            }
       
      
       

    }

    selectedLeague(item) {
        let AllLeguesentity = this.hass.states[this.config.Leaguesentity] || undefined;
   

        console.info(
            '%c' +  'entity_id:' +  item[2] ,
            'color: rgb(255 165 0);  font-weight: 700',
        );

        AllLeguesentity.state = item[1];
        AllLeguesentity.attributes.league = item[2]; 
/*
        console.info(
            '%c' + JSON.stringify(this.hass.states[this.config.Leaguesentity]) ,
            'color: rgb(255 165 0);  font-weight: 700',
        );
       */


        //http://192.168.1.147:8123/api/states/sensor.leagues
        
        this.hass.callApi('POST', 'states/sensor.leagues',AllLeguesentity)
        .then(console.log('UPDATE OK'));
    }

    render() {
        let AllGamesentitystate = this.hass.states[this.config.AllGamesentity] || undefined;
        let AllClassificationentity = this.hass.states[this.config.Classificationentity] || undefined;
        let AllLeguesentity = this.hass.states[this.config.Leaguesentity] || undefined;


        if (!AllGamesentitystate) {
            return html``;
        }
        
        let itemsAllGamesDate = AllGamesentitystate.attributes.weekday || [];
        let itemsClassification = AllClassificationentity.attributes.classificacao || [];
        let itemsLegues = AllLeguesentity.attributes.leagues || [];



        return html`<ha-card>


            <div class="U" id="match-rows_calendar">
               
                    <div class="dropdown"  @click=${() => this.divChanged()} >
                        <div  class="dropbtn">
                            <div class="Ic">
                                <div class="ei">
                                    <img  src=  ${AllLeguesentity.state != 'null' ? AllGamesentitystate.attributes.stgimg : ""} style="background-image: url(&quot;data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=&quot;);">
                                </div>
                            </div>
                            <div class="Jc">
                                <div class="Kc" id="category-header__stage">${AllLeguesentity.state != 'null' ? AllLeguesentity.state : "Please Select League"}</div>
                            </div>
                        </div>   
                   
                    
                        
                        <div  id = 'itemsLeagues' class="dropdown-content"  >
                             ${itemsLegues.length
                                ? itemsLegues.map(itemLegue => {
                                    return html` <a @click=${() => this.selectedLeague(itemLegue)}><img src=${AllGamesentitystate.attributes.stgimg} width="20" height="15">${itemLegue[1]}</a> `
                                })
                                : html``
                            }
                           
                           
                        </div>
                    </div>
                
            </div>
            <div class="U" id="match-rows_calendar">
                <div class="A" id="match-calendar__today">
                    <div class="I">
                        ${itemsAllGamesDate.length
                            ? html`
                                <a id="weekday${itemsAllGamesDate[0].name}" class="B X P G" @click=${() => this.weekdayClick(itemsAllGamesDate[0].name)}>
                                <span>Today</span>
                                <span class="N">${itemsAllGamesDate[0].adate}</span>
                                </a>

                                <a id="weekday${itemsAllGamesDate[1].name}" class="B X P"  @click=${() => this.weekdayClick(itemsAllGamesDate[1].name)}>
                                    <span>${itemsAllGamesDate[1].name}</span>
                                    <span class="N">${itemsAllGamesDate[1].adate}</span>
                                </a>

                                <a id="weekday${itemsAllGamesDate[2].name}" class="B X P "  @click=${() => this.weekdayClick(itemsAllGamesDate[2].name)}>
                                    <span>${itemsAllGamesDate[2].name}</span>
                                    <span class="N">${itemsAllGamesDate[2].adate}</span>
                                </a>

                                <a id="weekday${itemsAllGamesDate[3].name}" class="B X P"  @click=${() => this.weekdayClick(itemsAllGamesDate[3].name)}>
                                    <span>${itemsAllGamesDate[3].name}</span>
                                    <span class="N">${itemsAllGamesDate[3].adate}</span> 
                                </a>

                                <a id="weekday${itemsAllGamesDate[4].name}" class="B X P"  @click=${() => this.weekdayClick(itemsAllGamesDate[4].name)}>
                                    <span>${itemsAllGamesDate[4].name}</span>
                                    <span class="N">${itemsAllGamesDate[4].adate}</span>
                                </a>
                            `
                            : html``
                        }
                     


                        
                    </div>
                </div>
            </div>






            ${itemsAllGamesDate.length
                ? itemsAllGamesDate.map(item => {
                    return html`

                    
                    ${item.games.length
                        ? item.games.map(games => {
                            return html`

                                <div class="Rk" id='games${item.name}' style="display:${itemsAllGamesDate[0].name === item.name ? "flex": "none"};">
                             
                                    <span class="fr jr kr">
                                        
                                        <span class="gr jr">${games.Eps === 'NS' ? games.hour: games.Eps}</span>
                                        
                                    </span>
                                    <div class="Dk">
                                    
                                        <div class="Ek">
                                            <div  class="Pk">
                                            <span style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;">
                                                <span style="box-sizing: border-box; display: block; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; max-width: 100%;">
                                                <img  aria-hidden="true" src="data:image/svg+xml,%3csvg%20
                                                                    xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" style="display: block; max-width: 100%; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px;">
                                                </span>
                                                <img  src=${games.t1Img} decoding="async" data-nimg="intrinsic" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;">
                                            </span>
                                            </div>
                                            <div  class="Gk">${games.t1}</div>
                                        </div>
                                        
                                        <div class="Fk">
                                            <div  class="Pk">
                                                <span style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;">
                                                    <span style="box-sizing: border-box; display: block; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; max-width: 100%;">
                                                    <img  aria-hidden="true" src="data:image/svg+xml,%3csvg%20
                                                                                xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" style="display: block; max-width: 100%; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px;">
                                                    </span>
                                                    <img  src=${games.t2Img} decoding="async" data-nimg="intrinsic" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;">
                                                </span>
                                            </div>
                                            <div  class="Gk">${games.t2}</div>
                                        </div>

                                    </div>
                                    
                                    <div class="Kk">
                                        <div  class="Lk">${games.Tr1}</div>
                                        <div  class="Mk">${games.Tr2}</div>
                                    </div>
                                </div>
                            `;
                        })
                        : html`<div id='games${item.name}' style="display: none;"> </div>`   
                    }  
                     
                    
                    `;
                })
                : html``
            }
        
            
            <div style="display: block; padding-top: 10px;">  
                <div  class="Ec">
                    <div class="Jc">
                        <div class="Kc" id="category-header__stage">Table</div>
                    </div>
                </div>       
            </div>
 
        
        
            <div id='table' style="display: block;" class="Vc">
                <div class="Og">
                <table id='ClassTable' class="Pg">
                    <thead>
                    <tr style="background-color: darkorange; position: sticky;">
                        <th class="Wg">#</th>
                        <th class="Vg">Team</th>
                        <th class="Xg">
                        <span>P</span>
                        </th>
                        <th class="Xg">
                        <span>W</span>
                        </th>
                        <th class="Xg">

                        <span>D</span>
                        </th>
                        <th class="Xg">
                        <span>L</span>
                        </th>
                        <th class="Xg">

                        <span>F</span>
                        </th>
                        <th class="Xg">
                        <span>A</span>
                        </th>
                        <th class="Xg">
                        <span>GD</span>
                        </th>
                        <th class="Xg">
                        <span>Pts</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                       

                    ${itemsClassification.length
                        ? itemsClassification.map(item => {
                            return html`
                            <tr class="" >
                                <td class="hp" >${item.pos}</td>
                                <td class="Rg">
                                    <a class="bh Sj">
                                        <div class="ch">
                                        <span style="box-sizing: border-box; display: inline-block; overflow: hidden; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; position: relative; max-width: 100%;">
                                            <span style="box-sizing: border-box; display: block; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px; max-width: 100%;">
                                            <img alt="" aria-hidden="true" src="data:image/svg+xml,%3csvg%20
                                                                xmlns=%27http://www.w3.org/2000/svg%27%20version=%271.1%27%20width=%2750%27%20height=%2750%27/%3e" style="display: block; max-width: 100%; width: initial; height: initial; background: none; opacity: 1; border: 0px; margin: 0px; padding: 0px;">
                                            </span>
                                            <img alt="Benfica" src="${item.Img}" decoding="async" data-nimg="intrinsic" style="position: absolute; inset: 0px; box-sizing: border-box; padding: 0px; border: none; margin: auto; display: block; width: 0px; height: 0px; min-width: 100%; max-width: 100%; min-height: 100%; max-height: 100%;">
                                            <noscript></noscript>
                                        </span>
                                        </div>${item.equipa}
                                    </a>
                                    </a>
                                </td>
                                <td class="Tg">${item.jogos}</td>
                                <td class="Tg">${item.vitorias}</td>
                                <td class="Tg">${item.empates}</td>
                                <td class="Tg">${item.Derrotas}</td>
                                <td class="Tg" >${item.GM}</td>
                                <td class="Tg">${item.GS}</td>
                                <td class="Tg">${item.DG}</td>
                                <td class="Tg">${item.Pontos}</td>
                                </tr>
                            </tr>
                            `;
                        })
                        : html``
                    }


                
                    </tbody>
                </table>
                </div>
            </div>
       
            
        </ha-card>`;
    }
    
    static get styles() {
        return css`    
        .dropbtn {
            display: flex;
            font-size: 14px;
            padding: 10px 15px;
            min-width: 0px;
           
        }
  
        .dropdown {
            position: relative;
            /*display: inline-block*/;
        }
  
        .dropdown-content {
            display: none;
            /*position: absolute;*/
            background-color: #f9f9f9;
            min-width: 160px;
            box-shadow: 0px 8px 16px 
            0px rgba(0, 0, 0, 0.2);
            z-index: 9999;
        }
  
        .dropdown-content a {
            color: black;
            padding: 12px 16px;
            text-decoration: none;
            display: block;
        }
  
        .dropdown-content a:hover {
            background-color: #f1f1f1
        }
  

  
        
   
        .A{
            display:flex;
            justify-content:center;
            width:100%;
            height:50px;
            text-align:center;
            align-items:center;
            padding:0 15px;
        }
        .A a{
            flex:1 1;
            text-decoration:none;
        }
        @media (max-width:1023px){
            .A{
                position:relative;
            }
        }
        @media (max-width:350px){
            .A{
                padding:0 10px 0 0;
            }
        }
        .B{
            display:flex;
            flex:1 1;
            justify-content:center;
            position:relative;
            z-index:30;
        }
        .D{
            flex:0 0 45px;
        }
        .D{
            text-align:left;
        }
        .I{
            width:80%;
            display:flex;
            justify-content:center;
            align-items:center;
        }
        .I>a{
            z-index:30;
            
        }
        @media (max-width:1023px){
            .I{
                width:70%;
            }
        }
        .N{
            margin:2px;
            font-size:9px;
            white-space:nowrap;
        }
        .P{
            text-transform:uppercase;
            cursor:pointer;
            color:#aaa;
            display:flex;
            flex-direction:column;
            font-weight:700;
            font-size:11px;
        }
        .P.G{
            font-weight:700;
        }
        .P.G{
            color:#ff6b00;
        }
        .U{
            border-bottom:1px solid #222;
        }

        .bi{
           text-decoration:none;
           display:inherit;
           align-items:inherit;
       }
        *{
           box-sizing:border-box;
       }
        .sr-only{
           position:absolute;
           width:1px;
           height:1px;
           padding:0;
           margin:-1px;
           overflow:hidden;
           clip:rect(0,0,0,0);
           border:0;
       }

        .hi{
           background:transparent;
           border:none;
           cursor:pointer;
       }
        .hi:active,.hi:focus{
           outline:none;
       }
        .hi svg{
           fill:#fdfdfd;
           height:20px;
           width:20px;
       }
        @media (min-width:1024px){
            .hi svg:hover{
               fill:#ff6b00;
           }
       }
        .ei{
           display:flex;
           align-items:center;
           width:20px;
           min-width:20px;
           height:100%;
       }
        .ei img{
           width:100%;
           min-height:12px;
           text-indent:-10000px;
           background-size:20px 12px;
           background-repeat:no-repeat;
           background-position:50%;
       }
        .Ec{
           font-size:14px;
           padding:10px 15px;
           min-width:0;
           border: 1px solid #222;
       }
        .Ec,.Ec>a{
           display:flex;
       }
        .Ec>a{
           align-items:center;
           text-decoration:none;
           overflow:hidden;
           white-space:nowrap;
       }
        .Hc{
           min-width:0;
       }
        .Ic{
           display:flex;
           margin-right:13px;
           position:relative;
       }
        .Ic img{
           border-radius:2px;
       }
        .Jc{
           flex:1 1;
           width:auto;
       }
        .Jc,.Kc{
           overflow:hidden;
           white-space:nowrap;
           text-overflow:ellipsis;
       }
        .Kc{
           color:#fdfdfd;
           font-weight:700;
           margin-bottom:2px;
       }
        .Mc{
           font-size:11px;
           color:#aaa;
       }
        .Nc{
           display:flex;
           margin-left:auto;
           align-items:center;
           -webkit-user-select:none;
           -moz-user-select:none;
           -ms-user-select:none;
           user-select:none;
       }
        .Oc{
           padding:0;
           margin-left:30px;
       }
       
        


        
        .bi{
            text-decoration:none;
            display:inherit;
            align-items:inherit;
        }
   
         .sr-only{
            position:absolute;
            width:1px;
            height:1px;
            padding:0;
            margin:-1px;
            overflow:hidden;
            clip:rect(0,0,0,0);
            border:0;
        }
         .hi{
            background:transparent;
            border:none;
            cursor:pointer;
        }
         .hi:active,.hi:focus{
            outline:none;
        }
         .hi svg{
            fill:#fdfdfd;
            height:20px;
            width:20px;
        }
         @media (min-width:1024px){
             .hi svg:hover{
                fill:#ff6b00;
            }
        }
         .wk{
            color:#aaa;
            cursor:default;
            padding-bottom:5px;
            position:relative;
        }
         .zk.wk:before{
            background:#ff6b00;
        }
         .wk a{
            text-decoration:none;
        }
         .wk:before{
            border-radius:0 7.5px 7.5px 0;
            content:"";
            display:block;
            height:calc(100% - 20px);
            left:10px;
            position:absolute;
            top:10px;
            width:5px;
            z-index:20;
        }
         .Dk{
            flex:1 1;
            min-width:0;
        }
         @media (min-width:401px)and (max-width:600px){
             .Dk{
                max-width:100%;
            }
        }
         .Ek,.Fk{
            display:flex;
            flex:1 1;
            letter-spacing:.41px;
            position:relative;
        }
         .Ek .Gk,.Fk .Gk{
            align-self:center;
            overflow:hidden;
            text-overflow:ellipsis;
            white-space:nowrap;
        }
         .Ek{
            margin-bottom:5px;
        }
         .Kk{
            color:#fdfdfd;
            flex:0 0 30px;
            flex-direction:column;
            font-weight:700;
            position:relative;
            margin-right:13px;
        }
         .Kk,.Lk,.Mk{
            display:flex;
        }
         .Lk,.Mk{
            align-self:flex-end;
            align-items:center;
            height:20px;
        }
         .Lk{
            margin-bottom:5px;
        }
         .Pk{
            margin-right:10px;
        }
         .Pk{
            display:flex;
        }
         .Pk img{
            max-height:20px;
            max-width:20px;
        }
         .wk.zk .Kk{
            color:#fdfdfd;
        }
         .Rk{

            display:flex;
            align-items:center;
            font-size:14px;
            position:relative;
            padding:10px 0;
            flex:1 1;
            text-decoration:none;
            color:#aaa;
            border: 1px solid #222;
            border-radius:7.5px;
            margin:10px 10px;
        }
         @media (min-width:1024px){
             .Rk:hover{
                color:#fdfdfd;
                background:#333;
            }
        }
         .Sk{
            cursor:pointer;
            padding:0;
        }
         .Sk>div{
            justify-content:center;
            width:100%;
            height:100%;
        }
         .Sk>div,.Tk{
            display:flex;
            align-items:center;
        }
         .Tk{
            width:35px;
            align-self:stretch;
        }
         .fr{
            flex:0 0 50px;
            flex-direction:column;
            position:relative;
            color:#aaa;
            padding:4px 0 0;
            font-size:11px;
            justify-content:space-between;
            height:40px;
        }
         .fr,.gr{
            display:flex;
        }
         .gr{
            justify-content:center;
        }
         .jr{
            color:#ff6b00;
            font-weight:700;
           
            margin:10px
        }
         .kr{
            justify-content:center;
        }
          
        .Tg {
            text-align: center;
        }

        .bh .ch {
            height: 20px;
            width: 20px;
            margin-right: 10px;
        }
        
        .Rg, .Sg, .Tg, .Ug, .Vg, .Wg, .Xg {
            height: 38px;
        }


        .Sj {
            text-decoration: none;
            display: inherit;
            align-items: inherit;
        }

        .bh {
            display: flex;
            align-items: center;
            height: 37px;
            color: #fdfdfd;
        }


        .hp {
            text-align: center;
            position: relative;
        }
        

                 


        .Og {
            font-size: 11px;
            height: -webkit-fit-content;
            height: -moz-fit-content;
            height: fit-content;
            margin: 0 10px 10px;
          
            border-radius: 8px;
            overflow: hidden;
        }

        .Pg {
            width: 100%;
            border-spacing: 0;
            border-collapse: collapse;
        }

        .Vc:not(:last-child) {
            margin-bottom: 10px;
            border: 1px solid #222;
        }

        .Wg {
            width: 50px;
        }

        .Vg {
            text-align: left;
            text-transform: uppercase;
            min-width: 140px;
        }

        .Xg {
            width: 34px;
            text-align: center;
            cursor: default;
            position: relative;
            text-transform: uppercase;
        }
        `;
    }
}

customElements.define('football-card-editor', FootballCardEditor);
customElements.define('football-card', FootballCard);

window.customCards = window.customCards || [];
window.customCards.push({
    preview: true,
    type: 'football-card',
    name: 'Football Card',
    description: 'Custom card for displaying lists from Todoist.',
});

console.info(
    '%c ⚽Football-CARD⚽ \n ' + CARD_VERSION,
    'color: #ef5350; font-weight: 700;',
);




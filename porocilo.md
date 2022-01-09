<!-- NASLOVNICA -->

# Računalniška grafika

## Abstract

Igra Mansion of Terror je strašljiva sestavljanka. Vse sobe so temne, edina svetloba prihaja iz svetilke kar poskrbi za bolj strašno vzdušje, v ozadju pa se tudi predvaja strašljiva glasba.
Svetilka je realizirana v glsl senčilniku. V igri so objekti s katerimi igralec lahko interektira. Ob interakciji se lahko zgodijo različne stvari, ponavadi pa so to animacije.

1.1 Opis sveta
Igra se dogaja v stavbi s tremi sobami.
Igralec mora priti čez vse 3 sobe, da lahko zbeži in s tem zaključi igro.
V svetu, kjer se dogaja igra, so na 3d modelih uporabljene različne texture,
da je izgled igre čim bolj realistično in vživljajoče.

1.1.1 Pregled
Podpoglavje naj vsebuje podrobnejso predstavitev sveta, ˇ
s katerim interaktira uporabnik.

1.1.2 Ozadje
Igra Mansion of terror se dogaja v zaprtih, zatemnjenih prostorih, edino ozadje, ki se vidi so teksutre na stenah in predmetih v sobi.
V prehodu ko igralec pade iz druge sobe v tretjo, smo za ozadje uporabili le črno barvo.

1.1.3 Kljucne lokacije ˇ
Klučne lokacije v igri so lokacije interakcij, kjer mora igralec interaktirati z predmeti, da lahko napreduje.
To so:
-V prvi sobi:
    -prostor kjer igralec pobere varovalko s tal
    -varovalna omarica, kamor igralec vstavi varovalko
    -dvižna vrata, ki se lahko odprejo le ko igralec poveže električni krog z vstavljanjem varovalke v omarico

-V drugi sobi:
    -prostor, na koncu stopnic, kjer se stopnice udrejo, in igralec z njimi pade v črno globino, da se zgodi prehod v tretjo sobo
    -Ko igralec zaključi s tretjo sobo se ponovno znajde v drugi sobi, sedaj lahko odpre vrata dvigala, dvigalo pa ga popelje v konec igre

-V tretji sobi:
    -prostor na drugem koncu kanalizacije, kjer je lestev, katero mora igralec doseči za napredovanje
    -do lestve za napredovanje pride s prečaknjem kanalizacijskega potoka na večih mestih, s pomočjo skakanja po odpadkih in ruševinah, ki so v potoku

1.1.4 Velikost
Igralec se po stavbi premika v pogledu prve osebe.
Velikosti sob so približne meram prostorov v realnem življenju, 
Prva soba ki je skladišče, je večja in vsebuje velike police.
Najvišji nivo interakcije igralca z objektom, je no


Dobro opredelite velikost sveta in nivo na katerem bo
s svetom interaktiral uporabnik. Kaksen pogled v svet ˇ
bo primarno zajet v igri (npr. obmocje mize, sobe, me- ˇ
sta, pokrajine, kontineta, planeta, osoncja, ozvezdja, ga- ˇ
laksije ipd.)
1.1.5 Objekti
Predstavite poglavitne objekte, ki bodo zajeti v igri. Kje
ste jih oz. jih boste pridobili. Ali ste jih oz. jih boste
izdelali sami ipd.
1.1.6 Cas ˇ
Opredelite hitrost casa v va ˇ si igri. Kako hitro bodo mine- ˇ
vala dolocena obdobja (npr. 1 dan v igri je 5 minut igral- ˇ
nega casa ali 1 minuta v igri predstavlja 1 uro igralnega ˇ
casa). ˇ


## 1.2 Igralni pogon in uporabljene tehnologije

Za izdelavo igre smo uporabili samo webgl2 + JavaScript, modele in animacije smo naložili iz gltf blender izvozov. Za bazo igralnega pogona smo uporabili 90-gltf primer iz webgl2-examples repozitorija: https://github.com/UL-FRI-LGM/webgl2-examples/tree/master/examples/90-gltf  

V izhodiščnem primeru je bilo veliko stvari že implementiranih, ker smo hoteli modele vključno z animacijami izvoziti iz blenderja, smo v GLTFLoader.js dodali še podporo za nalaganje animacij. Naredili smo tudi razrez Animation, ki hrani "keyframe" in metode za interpolacije med keyframe-i.  
Podprte animacije:
- Step interpolation
- Linear interpolation
- Spherical linear interpolation

Izhodiščni primer smo tudi nasploh naredili bolj fleksibilen, npr. naredili smo nov razred MeshRenderer in ga ob nalaganju iz gltf datoteke pripeli na Node objekt. Če bi se v prihodnosti odločili, da bi naš pogon podpiral tudi Armature in animacije armatur bi lahko naredili še en razred, ki bi uporabljal nek drug senčilnik, v render zanki pa bi še vedno klicali samo node.renderer.render()...  

Ker ima naša igra določen nek potek (npr: Preden igralec lahko odpre vrata, mora pritisniti gumb), smo si sami zamislili nek json format za opisovanje dogodkov.

### Primer formata:  

```js
export const scenes = Room1: {
    name: "first_room",
    interactables: [
      { name: "Flashlight", type: "carry", carrying: true },
      {
        name: "Switch",
        type: "interact",
        interact: { play: ["SwitchAnimation"] },
      },
    ],
    animations: {
      SwitchAnimation: {
        before: ["disableAABB", "disableInteractable"],
        disableInteractables: ["Invisible_openDoors"],
        disableNodes: ["left_door"],
        after: [""]
      }
  }
}
````

## 1.3 Pogled

Uporabili smo Perspektivno kamero uvoženo iz blenderja preko gltf-ja.
Igralca se ne vidi.

1.3 Pogled
Definirajte kaksen bo pogled v va ˇ so igro. Kak ˇ sno kamero ˇ
boste uporabili, kaj vse bo uporabnik videl, kako boste
poudarjali posamezne stvari ipd.
2 Osebek
V tem poglavju podrobno predstavite osebek oz. osebke
v igri. Povejte nad katerimi osebki bo imel nadzor uporabnik in nad katerimi ne. Kako se z osebkom oz. osebki
upravlja, Kaksne so akcije osebka ipd. ˇ
3 Uporabniski vmesnik ˇ
Poglavje naj podrobno predstavi uporabniski vmesnik. Od ˇ
izgleda pa do same implementacije in interakcije. Utemeljite zakaj ste uporabili taksen vmesnik kot ste ga. ˇ
4 Glasba in zvok
V kolikor v igri uporabite glasbo in zvok predstavite kaksna glasba je v va ˇ si igri in zakaj. Ali se glasba prilagaja ˇ
posameznim situacijam? Kako je z zvocnimi efekti? Kje ˇ
ste jih pridobili? Kje uporabili?
5 Gameplay
Nenazadnje predstavite tudi sam gameplay - potek igranja vase igre. Kako se igra pri ˇ cne in na kak ˇ sne na ˇ cine jo ˇ
lahko zakljucimo? Kak ˇ sne akcije so uporabniku na voljo ˇ
med samo igro in na kaj vplicajo?
6 Zakljucki in mo ˇ zne nadgradnje ˇ
V poglavju povzemite cesa ste se pri izdelavi igre nau ˇ cili. ˇ
Ali ste pri predmetu pridobili dovolj znanja oz. kje je bilo
pomanjkanje? Povzemite tudi do kaksnih razlik je pri ˇ slo ˇ
med predvidenim scenarijem in koncno izvedbo igre. 

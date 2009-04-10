var atl = new AptanaTvLib;
var myriad = { src: atl.baseUrl + 'images_flash/myriad.swf'}

sIFR.activate(myriad);

sIFR.replace(myriad, {
  selector: 'h1.myriad',
  css: '.sIFR-root { background-color: transparent; color: #333333; font-size: 35px; kerning: true; leading: -5; }',
  transparent: true
});

sIFR.replace(myriad, {
	selector: 'h2.myriad',
	css: '.sIFR-root { background-color: transparent; color: #333333; font-size: 25px; kerning: true; leading: -5; }',
  transparent: true
});

sIFR.replace(myriad, {
	selector: 'h3.myriad',
	css: '.sIFR-root { background-color: transparent; color: #333333; font-size: 20px; kerning: true; leading: -5; }',
  transparent: true
});

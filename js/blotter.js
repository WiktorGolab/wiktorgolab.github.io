const text = new Blotter.Text('Cześć!', {
    family: "Oxanium, serif",
    size: 200,
    weight: 900,
    fill: 'white'
});

let material = new Blotter.LiquidDistortMaterial();
material.uniforms.uSpeed.value = 0.1;
material.uniforms.uVolatility.value = 0.03;
material.uniforms.uSeed.value = 0.1;

let blotter = new Blotter(material, {
    texts: text
});

let scope = blotter.forText(text);
scope.appendTo(document.getElementById('text-distortion'));

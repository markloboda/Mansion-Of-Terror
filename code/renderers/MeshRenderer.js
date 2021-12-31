

export default class MeshRenderer {
	constructor(mesh) {
		this.mesh = mesh;
	}
	render(gl, mvpMatrix, programs, glObjects) {
		gl.useProgram(programs.simple.program);
		const program = programs.simple;
		for (const primitive of this.mesh.primitives) {
			
			const vao = glObjects.get(primitive);
			
			const material = primitive.material;
			const texture = material.baseColorTexture;
			const glTexture = glObjects.get(texture.image);
			const glSampler = glObjects.get(texture.sampler);
			
			gl.bindVertexArray(vao);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, glTexture);
			gl.bindSampler(0, glSampler);
			
			gl.uniformMatrix4fv(program.uniforms.uMvpMatrix, false, mvpMatrix);
			if (primitive.indices) {
				const mode = primitive.mode;
				const count = primitive.indices.count;
				const type = primitive.indices.componentType;
				gl.drawElements(mode, count, type, 0);
			} else {
				const mode = primitive.mode;
				const count = primitive.attributes.POSITION.count;
				gl.drawArrays(mode, 0, count);
			}
		}
	}
}

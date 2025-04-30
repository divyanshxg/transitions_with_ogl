float M_PI = 3.141529;
uniform mat4 projectionMatrix;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;

attribute vec3 position;
attribute vec2 uv;
uniform float uStrength;
uniform int shape;

varying vec2 vUv;

vec3 deformation(vec3 position, vec2 uv, vec2 offset) {
    position.x += (sin(uv.y * M_PI) * offset.x);
    position.y += (sin(uv.x * M_PI) * offset.y);
    return position;
}

vec3 deformationZ(vec3 position, vec2 uv, vec2 offset) {
    position.z += (sin(uv.y * M_PI) * offset.x);
    position.z += (sin(uv.x * M_PI) * offset.y);
    return position;
}

void main(){
  vUv = uv;
  vec2 u = uv;
  u -= 0.5;
  u *= 2.0;

  u = vec2(smoothstep(-0.1,2.0 ,length(u) ));


  vec3 pos = position;

  if(shape == 2){
    vec3 def = deformation(position , uv ,vec2(uStrength , 0.0));
    pos = def;
    
  }else{
    vec3 def = deformationZ(position , uv ,vec2(-uStrength , 0.0));
    pos = def;
  }
  gl_Position = projectionMatrix * viewMatrix *modelMatrix * vec4(pos, 1.0);
}


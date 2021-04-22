import {noise, noiseSeed} from '@chriscourses/perlin-noise'
import * as THREE from 'three'
noiseSeed(43)

/**
 * Panel geometry
 * Geometry is a cuboid with for vertices in the back, NxN in the front and 2*N vertices on the sides.
 * The back shares vertices with the sides at the corners. The sides are divided into slices with 2
 * vertices on the back edge and 2 shared with the front. The layout is:
 * [0 - N-1]: back left side
 * [N - M+N-1]: back top
 * [M+N - M+2N-1]: back right
 * [M+2N - 2(M+N)-1]: back bottom
 * [2(M+N) - 2(M+N)+ M*N]: front left to right, top to bottom
 */

 const lerp = (a, b, x) => a + x*(b-a)
 export const panelGeometry = (w, h, d, M, N, uvScale, zfn) => {
     const l=-w/2, r=w/2, t=h/2, b=-h/2, bk = -d/2, f=d/2
     const vertices = []
     for (let i=0; i<N; i++) vertices.push(l, lerp(b,t,i/(N-1)), bk) // back left, bottom to top
     for (let i=0; i<M; i++) vertices.push(lerp(l,r,i/(M-1)), t, bk) // back top, left to right
     for (let i=0; i<N; i++) vertices.push(r, lerp(t,b,i/(N-1)), bk) // back right, top to bottom
     for (let i=0; i<M; i++) vertices.push(lerp(r,l,i/(M-1)), b, bk) // back bottom, right to left
     for (let j=0; j<N; j++) for (let i=0; i<M; i++) 
         vertices.push(lerp(l,r,i/(M-1)), lerp(b,t,j/(N-1)), f + zfn(i/(M-1), j/(N-1)))
     const indices = []
 
     indices.push(0, N, M+N, 0, M+N, M+2*N)  // back rectangle
     const so = 2*(M+N)
     for (let i=0; i<N-1; i++) indices.push(i, so+i*M, so+(i+1)*M, i, so+(i+1)*M, i+1)
     for (let i=0; i<M-1; i++) indices.push(N+i, so+(N-1)*M+i, so+(N-1)*M+i+1, N+i, so+(N-1)*M+i+1, N+i+1)
     for (let i=0; i<N-1; i++) indices.push(M+N+i, so+(N-i)*M-1, so+(N-i-1)*M-1, M+N+i, so+(N-i-1)*M-1, M+N+i+1)
     for (let i=0; i<M-1; i++) indices.push(M+2*N+i, so+M-i-1, so+M-i-2, M+2*N+i, so+M-i-2, M+2*N+i+1)
     for (let i=0; i<M-1; i++) for (let j=0; j<N-1; j++)
         indices.push(so+i+j*M, so+i+(j+1)*M+1, so+i+(j+1)*M, so+i+j*M, so+i+j*M+1, so+i+(j+1)*M+1)
 
     const geometry = new THREE.BufferGeometry();
     geometry.setIndex(indices)
     geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
 
     // const normals = []
     // for (let i=0; i<N; i++) normals.push(-1,0,0)
     // for (let i=0; i<M; i++) normals.push(0,1,0)
     // for (let i=0; i<N; i++) normals.push(1,0,0)
     // for (let i=0; i<M; i++) normals.push(0,-1,0)
     // for (let j=0; j<N; j++) for (let i=0; i<M; i++) {
     //     const x = i/(M-1), y = j/(N-1), d=.00001
     //     const center = zfn(x,y)
     //     const tangent = new THREE.Vector3(d, 0, zfn(x+d,y)-center)
     //     const bitangent = new THREE.Vector3(0, d, zfn(x,y+d)-center)
     //     const n = tangent.cross(bitangent).normalize()
     //     normals.push(n.x, n.y, n.z)
     // }
     // geometry.setAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
 
     if (uvScale > 0) {
         const uv = []
         for (let i=0; i<N; i++) uv.push(uvScale*(l-d), uvScale*lerp(b,t,i/(N-1))) // back left, bottom to top
         for (let i=0; i<M; i++) uv.push(uvScale*lerp(l,r,i/(M-1)), uvScale*(t+d)) // back top, left to right
         for (let i=0; i<N; i++) uv.push(uvScale*(r+d), uvScale*lerp(t,b,i/(N-1))) // back right, top to bottom
         for (let i=0; i<M; i++) uv.push(uvScale*lerp(r,l,i/(M-1)), uvScale*(b-d)) // back bottom, right to left
         for (let j=0; j<N; j++) for (let i=0; i<M; i++) uv.push(uvScale*lerp(l,r,i/(M-1)), uvScale*lerp(b,t,j/(N-1)))
         uv[0] = uvScale * l, uv[1] = uvScale * b
         uv[2*N] = uvScale * l, uv[2*N+1] = uvScale * t
         uv[2*(N+M)] = uvScale * r, uv[2*(N+M)+1] = uvScale * t
         uv[2*(2*N+M)] = uvScale * r, uv[2*(2*N+M)+1] = uvScale * b
         geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( uv, 2 ) );
     }
  
     geometry.computeVertexNormals()
     return geometry
 }
 
 const fillet = (offset, r) => {
     const d = 1 - 2*offset, theta = Math.atan2(1,d)
     const bisect = (Math.PI-theta)/2, proj = r / Math.tan(bisect)
     const x1 = offset - proj, x2 = offset + proj * Math.cos(theta), x3=1-x2, x4=1-x1
     return x => {
         if (x < x1) return 0
         if (x < x2) return r - Math.sqrt(r*r - (x1-x)*(x1-x))
         if (x < x3) return (x - offset) / d
         if (x < x4) return 1 - r + Math.sqrt(r*r - (x4-x)*(x4-x))
         return 1
     }
 }
 
 const fil = fillet(.22, .3)
 const offsetx = 32.5, offsety = 44.5, nfreq = .1, nscale = 320
 const relief = (x, y) => {
     const x_1 = 80*x - 120
     const y_1 = 200*y - 80
     const x_2 = x_1 + nscale*noise(offsetx+nfreq*x, offsety+nfreq*y)
     const y_2 = y_1 + nscale*noise(offsety+nfreq*x, offsety+nfreq*y)
 
     const r = Math.sqrt(x_2*x_2 + y_2*y_2)
     const t = Math.atan2(y_2,x_2) + Math.PI
 
     const r_ = Math.PI/2
     const t_ = 2*((t+Math.PI/4)%(Math.PI/2) - Math.PI/4)
     const h = Math.max(0, r*Math.sqrt(r_*r_ - t_*t_) - 40)
     return .05*fil((.5 + .5*Math.cos(.05*h)))
 }
   
 export const zfn = (tx,ty,w,h) => (x,y) => {
     return relief(tx + x*w, ty + y*h)
 }
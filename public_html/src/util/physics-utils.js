import * as CANNON from "../../vendor/cannon-es.js";


class PhysicsUtils {
    static convertThreeGeometryToCannonConvexPolyhedron(geometry) {
        let vertices = [];
        let faces = [];
        let faceNormals = [];

        for (let i = 0; i < geometry.vertices.length; i++) {
            vertices.push(new CANNON.Vec3(geometry.vertices[i].x, geometry.vertices[i].y, geometry.vertices[i].z));
        }

        for (let i = 0; i < geometry.faces.length; i++) {
            faces.push([geometry.faces[i].a, geometry.faces[i].b, geometry.faces[i].c]);
            let normal = geometry.faces[i].normal;
            faceNormals.push(new CANNON.Vec3(normal.x, normal.y, normal.z));
        }

        let shape = new CANNON.ConvexPolyhedron({vertices: vertices, faces: faces, normals: faceNormals});
        return shape;
    }
}

export default PhysicsUtils;

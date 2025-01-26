import { Router, Request, Response } from "express"

const router = Router()

/**
 * @swagger
 * /api/example1:
 *   get:
 *     summary: Example endpoint
 *     description: Returns a simple example response
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get("/example1", (req: Request, res: Response) => {
  res.json({ message: "Hello, world!" })
})

export default router
